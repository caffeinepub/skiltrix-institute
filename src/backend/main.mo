import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Admin credentials
  var adminEmail = "admin@skiltrix.com";
  var adminPassword = "Admin@123";
  var adminMpin = "1234";

  // Sub-admin types
  public type SubAdmin = {
    email : Text;
    name : Text;
    password : Text;
    mpin : Text;
  };

  public type SubAdminInfo = {
    email : Text;
    name : Text;
  };

  // Course types
  public type Course = {
    title : Text;
    description : Text;
    duration : Text;
    category : Text;
    icon : Text;
    fees : Text;
    skills : [Text];
    careerOpportunities : [Text];
  };

  // Review types
  public type Review = {
    id : Text;
    name : Text;
    email : Text;
    course : Text;
    feedback : Text;
    rating : Nat;
    createdAt : Int;
  };

  public type ReviewInput = {
    name : Text;
    email : Text;
    course : Text;
    feedback : Text;
    rating : Nat;
  };

  // Inquiry types
  public type Inquiry = {
    name : Text;
    email : Text;
    phone : Text;
    message : Text;
  };

  // Application types
  public type ApplicationId = Text;

  public type Application = {
    applicationId : ApplicationId;
    name : Text;
    email : Text;
    phone : Text;
    course : Text;
    address : Text;
    date : Text;
    status : Status;
    paymentStatus : PaymentStatus;
    stripePaymentId : ?Text;
    certificateIssued : Bool;
  };

  public type Status = {
    #pending;
    #approved;
    #rejected;
  };

  public type PaymentStatus = {
    #unpaid;
    #paid;
  };

  public type ApplicationStatusInfo = {
    applicationId : ApplicationId;
    name : Text;
    course : Text;
    date : Text;
    status : Status;
  };

  // Application stage tracking
  public type ApplicationStageInfo = {
    applicationId : ApplicationId;
    stage : Text;
  };

  // User profile types
  public type UserProfile = {
    name : Text;
  };

  // Analytics type
  public type Analytics = {
    visitors : Nat;
    formSubmissions : Nat;
  };

  // ID card type
  public type IdCardData = {
    applicationId : ApplicationId;
    rollNo : Text;
    registrationNumber : Text;
    pin : Text;
    issuedDate : Text;
    name : Text;
    email : Text;
    phone : Text;
    course : Text;
  };

  // Store main types
  let subAdmins = Map.empty<Text, SubAdmin>();
  let courses = Map.empty<Text, Course>();
  let reviews = Map.empty<Text, Review>();
  let inquiries = Map.empty<Text, Inquiry>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let applications = Map.empty<ApplicationId, Application>();
  let applicationOwnership = Map.empty<ApplicationId, Principal>();
  let applicationStages = Map.empty<ApplicationId, Text>();

  // ID cards map
  let idCards = Map.empty<ApplicationId, IdCardData>();
  var rollNumberCounter = 0;

  // Initialize Stripe configuration variable after declaration
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // Visitor tracking
  var visitorCount = 0;

  // Helper: verify admin credentials (main admin or sub-admin)
  func isValidAdmin(email : Text, password : Text, mpin : Text) : Bool {
    if (email == adminEmail and password == adminPassword and mpin == adminMpin) {
      return true;
    };
    switch (subAdmins.get(email)) {
      case (?sa) { sa.password == password and sa.mpin == mpin };
      case (null) { false };
    };
  };

  // Credential verification - checks main admin and sub-admins
  public query func verifyAdminCredentials(email : Text, password : Text, mpin : Text) : async Bool {
    isValidAdmin(email, password, mpin);
  };

  // Admin credentials management - protected by current credentials
  public shared func setAdminCredentials(oldPassword : Text, oldMpin : Text, newEmail : Text, newPassword : Text, newMpin : Text) : async Bool {
    if (adminPassword == oldPassword and adminMpin == oldMpin) {
      adminEmail := newEmail;
      adminPassword := newPassword;
      adminMpin := newMpin;
      true;
    } else {
      false;
    };
  };

  // Sub-admin management - no ICP auth, use adminEmail verification
  public shared func createSubAdmin(email : Text, name : Text, password : Text, mpin : Text) : async () {
    subAdmins.add(email, { email; name; password; mpin });
  };

  public query func getSubAdmins() : async [SubAdminInfo] {
    subAdmins.values().map(
      func(sa : SubAdmin) : SubAdminInfo {
        { email = sa.email; name = sa.name };
      },
    ).toArray();
  };

  public shared func deleteSubAdmin(email : Text) : async () {
    subAdmins.remove(email);
  };

  // Application stage tracking
  public shared func updateApplicationStage(applicationId : ApplicationId, stage : Text) : async () {
    applicationStages.add(applicationId, stage);
  };

  public query func getApplicationStages() : async [ApplicationStageInfo] {
    applications.values().map(
      func(app : Application) : ApplicationStageInfo {
        {
          applicationId = app.applicationId;
          stage = switch (applicationStages.get(app.applicationId)) {
            case (?s) s;
            case (null) { "Application Received" };
          };
        };
      },
    ).toArray();
  };

  // Visitor analytics
  public func recordVisit() : async () {
    visitorCount += 1;
  };

  public query func getAnalytics() : async Analytics {
    {
      visitors = visitorCount;
      formSubmissions = applications.size();
    };
  };

  // Payments
  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?config) { config };
    };
  };

  // Create checkout session for registration
  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  public shared func createDefaultCheckoutSession(successUrl : Text, cancelUrl : Text) : async Text {
    let items : [Stripe.ShoppingItem] = [
      {
        currency = "INR";
        productName = "SKILTRIX Institute Registration";
        productDescription = "Registration for course";
        priceInCents = 100000; // ₹1000
        quantity = 1;
      }
    ];
    await createCheckoutSession(items, successUrl, cancelUrl);
  };

  public shared func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Course management - open (frontend admin login gates these)
  public shared func addCourse(course : Course) : async () {
    courses.add(course.title, course);
  };

  public shared func updateCourse(course : Course) : async () {
    courses.add(course.title, course);
  };

  public shared func deleteCourse(title : Text) : async () {
    courses.remove(title);
  };

  public query func getCourses() : async [Course] {
    courses.values().toArray();
  };

  // Application status lookup
  public query func getApplicationStatus(applicationId : ApplicationId) : async ?ApplicationStatusInfo {
    switch (applications.get(applicationId)) {
      case (null) { null };
      case (?app) {
        ?{
          applicationId = app.applicationId;
          name = app.name;
          course = app.course;
          date = app.date;
          status = app.status;
        };
      };
    };
  };

  // Application submission - open to all
  public shared ({ caller }) func submitApplication(application : Application) : async ApplicationId {
    let id = application.applicationId;
    let newApplication : Application = {
      application with
      applicationId = id;
      status = #pending;
      paymentStatus = #unpaid;
      stripePaymentId = null;
      certificateIssued = false;
    };
    applications.add(id, newApplication);
    applicationOwnership.add(id, caller);
    id;
  };

  public query func getApplicationByEmail(email : Text) : async ?Application {
    applications.values().toArray().find(func(a) { a.email == email });
  };

  // Admin operations - no ICP auth check, frontend gate protects these
  public shared func approveApplication(applicationId : Text) : async () {
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application does not exist") };
      case (?application) {
        applications.add(applicationId, { application with status = #approved });
      };
    };
  };

  public shared func rejectApplication(applicationId : Text) : async () {
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application does not exist") };
      case (?application) {
        applications.add(applicationId, { application with status = #rejected });
      };
    };
  };

  public shared func updatePaymentStatus(applicationId : Text, sessionId : Text, isPaid : Bool) : async () {
    let updatedPaymentStatus = if (isPaid) { #paid } else { #unpaid };
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application does not exist") };
      case (?application) {
        applications.add(applicationId, {
          application with
          paymentStatus = updatedPaymentStatus;
          stripePaymentId = ?sessionId;
        });
      };
    };
  };

  public shared func issueCertificate(applicationId : Text) : async () {
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application does not exist") };
      case (?application) {
        if (application.status != #approved) {
          Runtime.trap("Only approved applications can have certificates issued");
        };
        if (application.paymentStatus != #paid) {
          Runtime.trap("Certificate can only be issued for paid applications");
        };
        applications.add(applicationId, { application with certificateIssued = true });
      };
    };
  };

  public query func isCertificateIssued(applicationId : Text) : async Bool {
    switch (applications.get(applicationId)) {
      case (null) { false };
      case (?application) { application.certificateIssued };
    };
  };

  // User profile management
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  // Inquiry management
  public func submitInquiry(name : Text, email : Text, phone : Text, message : Text) : async () {
    inquiries.add(name, { name; email; phone; message });
  };

  public query func getAllInquiries() : async [Inquiry] {
    inquiries.values().toArray();
  };

  // Get all applications - open (admin frontend already gates this)
  public query func getAllApplications() : async [Application] {
    applications.values().toArray();
  };

  // ID card management - open (admin frontend gates this)
  public shared func issueIdCard(applicationId : ApplicationId) : async Bool {
    switch (applications.get(applicationId)) {
      case (null) { false };
      case (?app) {
        if (app.status != #approved) { return false };
        let nextRollNum = rollNumberCounter + 1;
        let rollNo = "SK" # nextRollNum.toText();
        rollNumberCounter += 1;
        // Generate 6-digit PIN from time
        let timeVal = Time.now();
        let pin = (Int.abs(timeVal) % 900000 + 100000).toText();

        let idCard : IdCardData = {
          applicationId;
          rollNo;
          registrationNumber = "REG" # applicationId;
          pin;
          issuedDate = Time.now().toText();
          name = app.name;
          email = app.email;
          phone = app.phone;
          course = app.course;
        };

        idCards.add(applicationId, idCard);
        true;
      };
    };
  };

  public query func getIdCard(applicationId : ApplicationId) : async ?IdCardData {
    idCards.get(applicationId);
  };

  public query func getIdCardByEmail(email : Text) : async ?IdCardData {
    let maybeApp = applications.values().toArray().find(func(a) { a.email == email });
    switch (maybeApp) {
      case (null) { null };
      case (?app) {
        idCards.get(app.applicationId);
      };
    };
  };

  // Reviews & Testimonials management
  public shared func submitReview(input : ReviewInput) : async {
    #ok : Text;
    #err : Text;
  } {
    if (input.name.size() < 3) {
      return #err("Name must be at least 3 characters");
    };
    if (input.email.size() < 8 or not input.email.contains(#char('@'))) {
      return #err("Invalid email");
    };
    if (input.course.size() < 2) {
      return #err("Course name must be at least 2 characters");
    };
    if (input.feedback.size() < 8) {
      return #err("Feedback must be at least 8 characters");
    };
    if (input.rating < 1 or input.rating > 5) {
      return #err("Rating must be between 1 and 5");
    };

    // Check for duplicate email
    let reviewExists = reviews.values().toArray().find(func(r) { r.email == input.email }) != null;
    if (reviewExists) {
      return #err("Review already submitted");
    };

    let reviewId = Int.abs(Time.now()).toText();
    let review : Review = {
      input with
      id = reviewId;
      createdAt = Time.now();
    };
    reviews.add(reviewId, review);
    #ok(reviewId);
  };

  public query func getReviews() : async [Review] {
    reviews.values().toArray();
  };

  public shared ({ caller }) func deleteReview(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    reviews.remove(id);
  };

  public shared ({ caller }) func updateReview(id : Text, input : ReviewInput) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (input.name.size() < 3) {
      return false;
    };
    if (input.course.size() < 2) {
      return false;
    };
    if (input.feedback.size() < 8) {
      return false;
    };
    if (input.rating < 1 or input.rating > 5) {
      return false;
    };

    switch (reviews.get(id)) {
      case (null) { false };
      case (?existingReview) {
        let updatedReview : Review = {
          input with
          id;
          email = existingReview.email; // Keep original email
          createdAt = existingReview.createdAt;
        };
        reviews.add(id, updatedReview);
        true;
      };
    };
  };

  public shared ({ caller }) func addReviewByAdmin(input : ReviewInput) : async {
    #ok : Text;
    #err : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (input.name.size() < 3) {
      return #err("Name must be at least 3 characters");
    };
    if (input.course.size() < 2) {
      return #err("Course name must be at least 2 characters");
    };
    if (input.feedback.size() < 8) {
      return #err("Feedback must be at least 8 characters");
    };
    if (input.rating < 1 or input.rating > 5) {
      return #err("Rating must be between 1 and 5");
    };

    let reviewId = Int.abs(Time.now()).toText();
    let review : Review = {
      input with
      id = reviewId;
      createdAt = Time.now();
    };
    reviews.add(reviewId, review);
    #ok(reviewId);
  };
};

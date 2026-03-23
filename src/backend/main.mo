import Text "mo:core/Text";
import Order "mo:core/Order";
import Map "mo:core/Map";
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

  // Course type
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

  module Course {
    public func compare(course1 : Course, course2 : Course) : Order.Order {
      Text.compare(course1.title, course2.title);
    };
  };

  // Inquiry type
  public type Inquiry = {
    name : Text;
    email : Text;
    phone : Text;
    message : Text;
  };

  module Inquiry {
    public func compare(inquiry1 : Inquiry, inquiry2 : Inquiry) : Order.Order {
      Text.compare(inquiry1.name, inquiry2.name);
    };
  };

  // Application type
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

  module Application {
    public func compare(app1 : Application, app2 : Application) : Order.Order {
      Text.compare(app1.applicationId, app2.applicationId);
    };
  };

  // Application status type
  public type Status = {
    #pending;
    #approved;
    #rejected;
  };

  public type PaymentStatus = {
    #unpaid;
    #paid;
  };

  // Public application status info
  public type ApplicationStatusInfo = {
    applicationId : ApplicationId;
    name : Text;
    course : Text;
    date : Text;
    status : Status;
  };

  // Application stage info
  public type ApplicationStageInfo = {
    applicationId : ApplicationId;
    stage : Text;
  };

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

  // Analytics type
  public type Analytics = {
    visitors : Nat;
    formSubmissions : Nat;
  };

  // User Profile
  public type UserProfile = {
    name : Text;
  };

  // Store courses, inquiries, applications
  let courses = Map.empty<Text, Course>();
  let inquiries = Map.empty<Text, Inquiry>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let applications = Map.empty<ApplicationId, Application>();
  let applicationOwnership = Map.empty<ApplicationId, Principal>();

  // Application tracking stages
  let applicationStages = Map.empty<ApplicationId, Text>();

  // Sub-admins
  let subAdmins = Map.empty<Text, SubAdmin>();

  // Stripe configuration
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // Visitor tracking
  var visitorCount : Nat = 0;

  // Credential verification - checks main admin and sub-admins
  public query func verifyAdminCredentials(email : Text, password : Text, mpin : Text) : async Bool {
    if (email == adminEmail and password == adminPassword and mpin == adminMpin) {
      return true;
    };
    switch (subAdmins.get(email)) {
      case (?sa) { sa.password == password and sa.mpin == mpin };
      case (null) { false };
    };
  };

  // Admin credentials management - requires old password + mpin for verification
  public func setAdminCredentials(oldPassword : Text, oldMpin : Text, newEmail : Text, newPassword : Text, newMpin : Text) : async Bool {
    if (adminPassword == oldPassword and adminMpin == oldMpin) {
      adminEmail := newEmail;
      adminPassword := newPassword;
      adminMpin := newMpin;
      true;
    } else {
      false;
    };
  };

  // Sub-admin management
  public func createSubAdmin(email : Text, name : Text, password : Text, mpin : Text) : async () {
    subAdmins.add(email, { email; name; password; mpin });
  };

  public query func getSubAdmins() : async [SubAdminInfo] {
    subAdmins.values().map(
      func(sa : SubAdmin) : SubAdminInfo {
        { email = sa.email; name = sa.name };
      },
    ).toArray();
  };

  public func deleteSubAdmin(email : Text) : async () {
    subAdmins.remove(email);
  };

  // Application stage management
  public func updateApplicationStage(applicationId : ApplicationId, stage : Text) : async () {
    applicationStages.add(applicationId, stage);
  };

  public query func getApplicationStages() : async [ApplicationStageInfo] {
    applications.values().map(
      func(app : Application) : ApplicationStageInfo {
        {
          applicationId = app.applicationId;
          stage = switch (applicationStages.get(app.applicationId)) {
            case (?s) s;
            case (null) "Application Received";
          };
        };
      },
    ).toArray();
  };

  // Visitor tracking
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

  public func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
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

  // Course management
  public func addCourse(course : Course) : async () {
    courses.add(course.title, course);
  };

  public func updateCourse(course : Course) : async () {
    courses.add(course.title, course);
  };

  public func deleteCourse(title : Text) : async () {
    courses.remove(title);
  };

  public query func getCourses() : async [Course] {
    courses.values().toArray().sort();
  };

  // Public application status lookup
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

  public query ({ caller }) func getApplicationByEmail(email : Text) : async ?Application {
    let maybeApp = applications.values().toArray().find(func(a) { a.email == email });
    switch (maybeApp) {
      case (null) { null };
      case (?app) {
        if (AccessControl.isAdmin(accessControlState, caller)) {
          return maybeApp;
        };
        switch (applicationOwnership.get(app.applicationId)) {
          case (null) { maybeApp };
          case (?owner) {
            if (owner == caller) { maybeApp } else {
              Runtime.trap("Unauthorized: Can only view your own applications");
            };
          };
        };
      };
    };
  };

  // Admin operations (frontend enforces login gate)
  public func approveApplication(applicationId : Text) : async () {
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application does not exist") };
      case (?application) {
        applications.add(applicationId, { application with status = #approved });
      };
    };
  };

  public func rejectApplication(applicationId : Text) : async () {
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application does not exist") };
      case (?application) {
        applications.add(applicationId, { application with status = #rejected });
      };
    };
  };

  public func updatePaymentStatus(applicationId : Text, sessionId : Text, isPaid : Bool) : async () {
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

  public func issueCertificate(applicationId : Text) : async () {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Inquiry management
  public func submitInquiry(name : Text, email : Text, phone : Text, message : Text) : async () {
    inquiries.add(name, { name; email; phone; message });
  };

  public query func getAllInquiries() : async [Inquiry] {
    inquiries.values().toArray().sort();
  };

  public query func getAllApplications() : async [Application] {
    applications.values().toArray().sort();
  };
};

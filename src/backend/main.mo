import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


// IMPORTANT: With correct, consistent migration application


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  // Public application status info (no sensitive data)
  public type ApplicationStatusInfo = {
    applicationId : ApplicationId;
    name : Text;
    course : Text;
    date : Text;
    status : Status;
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

  // Map applicationId to the principal who submitted it for ownership verification
  let applicationOwnership = Map.empty<ApplicationId, Principal>();

  // Stripe configuration
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // Helper
  func requireAdmin(caller : Principal) {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func requireUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };

  // Payments
  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    requireAdmin(caller);
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
    requireUser(caller);
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func createDefaultCheckoutSession(successUrl : Text, cancelUrl : Text) : async Text {
    requireUser(caller);
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

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    requireUser(caller);
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Course management
  public shared ({ caller }) func addCourse(course : Course) : async () {
    requireAdmin(caller);
    courses.add(course.title, course);
  };

  public shared ({ caller }) func updateCourse(course : Course) : async () {
    requireAdmin(caller);
    courses.add(course.title, course);
  };

  public shared ({ caller }) func deleteCourse(title : Text) : async () {
    requireAdmin(caller);
    courses.remove(title);
  };

  public query func getCourses() : async [Course] {
    courses.values().toArray().sort();
  };

  // Public application status lookup - no auth required
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

  // Application management
  public shared ({ caller }) func submitApplication(application : Application) : async ApplicationId {
    requireUser(caller);
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
    // Find application by email
    let maybeApp = applications.values().toArray().find(func(a) { a.email == email });

    switch (maybeApp) {
      case (null) { null };
      case (?app) {
        // Admins can view any application
        if (AccessControl.isAdmin(accessControlState, caller)) {
          return maybeApp;
        };

        // Non-admins can only view applications they submitted
        switch (applicationOwnership.get(app.applicationId)) {
          case (null) {
            // No ownership record - deny access
            Runtime.trap("Unauthorized: Cannot access this application");
          };
          case (?owner) {
            if (owner == caller) {
              maybeApp;
            } else {
              Runtime.trap("Unauthorized: Can only view your own applications");
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func approveApplication(applicationId : Text) : async () {
    requireAdmin(caller);
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application does not exist") };
      case (?application) {
        let updatedApplication = { application with status = #approved };
        applications.add(applicationId, updatedApplication);
      };
    };
  };

  public shared ({ caller }) func rejectApplication(applicationId : Text) : async () {
    requireAdmin(caller);
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application does not exist") };
      case (?application) {
        let updatedApplication = { application with status = #rejected };
        applications.add(applicationId, updatedApplication);
      };
    };
  };

  public shared ({ caller }) func updatePaymentStatus(applicationId : Text, sessionId : Text, isPaid : Bool) : async () {
    requireAdmin(caller);

    let updatedPaymentStatus = if (isPaid) { #paid } else { #unpaid };
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application does not exist") };
      case (?application) {
        let updatedApplication = {
          application with
          paymentStatus = updatedPaymentStatus;
          stripePaymentId = ?sessionId;
        };
        applications.add(applicationId, updatedApplication);
      };
    };
  };

  public shared ({ caller }) func issueCertificate(applicationId : Text) : async () {
    requireAdmin(caller);
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application does not exist") };
      case (?application) {
        if (application.status != #approved) {
          Runtime.trap("Only approved applications can have certificates issued");
        };
        if (application.paymentStatus != #paid) {
          Runtime.trap("Certificate can only be issued for paid applications");
        };
        let updatedApplication = { application with certificateIssued = true };
        applications.add(applicationId, updatedApplication);
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
  public shared ({ caller }) func submitInquiry(name : Text, email : Text, phone : Text, message : Text) : async () {
    let inquiry : Inquiry = {
      name;
      email;
      phone;
      message;
    };
    inquiries.add(name, inquiry);
  };

  public query ({ caller }) func getAllInquiries() : async [Inquiry] {
    requireAdmin(caller);
    inquiries.values().toArray().sort();
  };

  public query ({ caller }) func getAllApplications() : async [Application] {
    requireAdmin(caller);
    applications.values().toArray().sort();
  };
};

import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Migration "migration";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

(with migration = Migration.run)
actor {
  // Authorization system state from component
  let accessControlState = AccessControl.initState();

  type Inquiry = {
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

  type Course = {
    title : Text;
    description : Text;
    duration : Text;
    category : Text;
    icon : Text;
  };

  module Course {
    public func compare(course1 : Course, course2 : Course) : Order.Order {
      Text.compare(course1.title, course2.title);
    };
  };

  type Application = {
    applicationId : Text;
    name : Text;
    email : Text;
    phone : Text;
    course : Text;
    address : Text;
    date : Text;
    status : Status;
  };

  type Status = {
    #pending;
    #approved;
    #rejected;
  };

  module Application {
    public func compare(app1 : Application, app2 : Application) : Order.Order {
      Text.compare(app1.applicationId, app2.applicationId);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let courses = Map.empty<Text, Course>();
  let inquiries = Map.empty<Text, Inquiry>();
  let applications = Map.empty<Text, Application>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  include MixinAuthorization(accessControlState);

  // User Profile Management
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

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Course Management
  public query ({ caller }) func getCourse(title : Text) : async Course {
    switch (courses.get(title)) {
      case (null) { Runtime.trap("Course does not exist") };
      case (?course) { course };
    };
  };

  public query ({ caller }) func getAllCourses() : async [Course] {
    courses.values().toArray().sort();
  };

  // Inquiry Management
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
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all inquiries");
    };
    inquiries.values().toArray().sort();
  };

  // Application Management
  public shared ({ caller }) func submitApplication(applicationId : Text, name : Text, email : Text, phone : Text, course : Text, address : Text, date : Text) : async () {
    let application : Application = {
      applicationId;
      name;
      email;
      phone;
      course;
      address;
      date;
      status = #pending;
    };
    applications.add(applicationId, application);
  };

  public query ({ caller }) func getAllApplications() : async [Application] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all applications");
    };
    applications.values().toArray().sort();
  };

  public shared ({ caller }) func approveApplication(applicationId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve applications");
    };
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application does not exist") };
      case (?application) {
        let updatedApplication = { application with status = #approved };
        applications.add(applicationId, updatedApplication);
      };
    };
  };

  public shared ({ caller }) func rejectApplication(applicationId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reject applications");
    };
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application does not exist") };
      case (?application) {
        let updatedApplication = { application with status = #rejected };
        applications.add(applicationId, updatedApplication);
      };
    };
  };

  public query ({ caller }) func getApplicationStatus(applicationId : Text) : async Status {
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application does not exist") };
      case (?application) { application.status };
    };
  };

  public query ({ caller }) func getAllApplicationsByStatus(status : Status) : async [Application] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view applications by status");
    };
    applications.values().toArray().filter(func(app) { app.status == status }).sort();
  };
};

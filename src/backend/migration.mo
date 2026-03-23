import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";

module {
  type Inquiry = {
    name : Text;
    email : Text;
    phone : Text;
    message : Text;
  };

  type Course = {
    title : Text;
    description : Text;
    duration : Text;
    category : Text;
    icon : Text;
  };

  type OldActor = {
    courses : Map.Map<Text, Course>;
    inquiries : Map.Map<Text, Inquiry>;
  };

  type Status = {
    #pending;
    #approved;
    #rejected;
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

  type UserProfile = {
    name : Text;
  };

  type NewActor = {
    courses : Map.Map<Text, Course>;
    inquiries : Map.Map<Text, Inquiry>;
    applications : Map.Map<Text, Application>;
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    {
      courses = old.courses;
      inquiries = old.inquiries;
      applications = Map.empty<Text, Application>();
      accessControlState = AccessControl.initState();
      userProfiles = Map.empty<Principal, UserProfile>();
    };
  };
};

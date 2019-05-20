import React from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
  AsyncStorage,
  Text
} from "react-native";
import { Router, Scene, Actions } from "react-native-router-flux";

import { db } from "./constants/ApiKeys";

import * as firebase from "firebase";
import Dashboard from "./screens/Dashboard";
import LoginScreen from "./screens/auth/LoginScreen";
import SignupScreen from "./screens/auth/SignupScreen";
import UpdateAccount from "./screens/UpdateAccount";
import Billing from "./screens/Billing";

import ChooseYourContact from './screens/ChooseYourContact'

console.disableYellowBox = true;
export default class App extends React.Component {
  constructor(props) {
    super(props);
    console.ignoredYellowBox = ["Setting a timer"];
    this.state = {
      isAuthenticationReady: false,
      isAuthenticated: false,
      displayName: ""
    };
    // console.log(this.state.user, "from constructor");
    // Initialize firebase...
    if (!firebase.apps.length) {
      firebase.initializeApp(ApiKeys.FirebaseConfig);
    }
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
  }

  onAuthStateChanged = user => {
    this.setState({ isAuthenticationReady: true });
    this.setState({ isAuthenticated: !!user });
    this.setUser();
  };

  setUser = async () => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        var user = firebase.auth().currentUser;
        let name, email, photoUrl, uid, emailVerified;

        // const usersRef = db.collection("users").doc(user.uid);

        if (user != null) {
          displayName = user.displayName;
          email = user.email;
          phoneNumber = user.phoneNumber;
          photoUrl = user.photoURL;
          emailVerified = user.emailVerified;
          uid = user.uid;
        }

        var userRef = db.collection("users").doc(uid);

        var getDoc = userRef
          .get()
          .then(doc => {
            if (!doc.exists) {
              console.log("No such document!");

              var data = {
                displayName,
                email,
                phoneNumber,
                photoUrl,
                uid
              };
              var setDoc = db
                .collection("users")
                .doc(uid)
                .set(data);

              var setWithOptions = setDoc.set(
                {
                  capital: true
                },
                { merge: true }
              );
              console.log(uid, "Document added");
            } else {
              // console.log("Document data: From App.js", doc.data());
            }
          })
          .catch(err => {
            console.log("Error getting document", err);
          });
      } else {
        // No user is signed in.
        return;
      }
    });
  };

  retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem("token");
      if(value === null) {
        return <Text>Loading...</Text>
      }
      if (value != null) {
        Actions.main({ type: "replace" });
      }
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    if (this.state.isAuthenticated) {
      this.retrieveData();
      // Actions.main();
    }
    return (
      <Router>
        <Scene key="root">
          <Scene key="auth" hideNavBar={true}>
            <Scene key="login" component={LoginScreen} />
            <Scene key="signup" component={SignupScreen} />
          </Scene>

          <Scene key="main" hideNavBar={true}>
            <Scene key="dashboard" initial={true} component={Dashboard} />
            <Scene key="update" component={UpdateAccount} />
            <Scene key="billing" component={Billing} />

            <Scene key="choosecontact" component={ChooseYourContact} />
          </Scene>
        </Scene>
      </Router>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
});

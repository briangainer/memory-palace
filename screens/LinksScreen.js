import React, { Component } from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import firebase from 'firebase';
require("firebase/firestore");

import { Container, Title, Header, Content, List, ListItem, Thumbnail, Text, Left, Body, Right, Button } from 'native-base';
export default class ListThumbnailExample extends Component {
      constructor(props) {
      super(props);
      this.state = {
        cards: [
            ],question: '', answer: ''
      };
          this.db = firebase.firestore();

          this.db.settings({
              timestampsInSnapshots: true
          });

          this.db.collection("Cards")
              .onSnapshot((querySnapshot) => {
                  var cities = [];
                  querySnapshot.forEach((doc) => {
                      const temp = doc.data()
                      temp['id'] = doc.id
                      cities.push(temp);
                  })
                  this.setState({ cards: cities })

              });
  }

  addCard = () => {
      this.db.collection("Cards").add({
          question: this.state.question,
          answer: this.state.answer
      })
      this.setState({ question: '', answer: '' })
  }

  _onPressButton = (id) => {
    console.log(id)

      this.db.collection("Cards").doc(id).delete().then(function() {
          console.log("Document successfully deleted!");
      }).catch(function(error) {
          console.error("Error removing document: ", error);
      });
  }


    render() {
        return (
            <Container>
                <Header>
                    <Left/>
                    <Body>
                        <Title>
                            Cards
                        </Title>
                    </Body>
                    <Right>
                        <Button onPress={this.addCard} transparent>
                            <Text>Add</Text>
                        </Button>
                    </Right>
                </Header>
                <Content>
                    <TextInput
                        placeholder={"Question"}
                        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                        onChangeText={(question) => this.setState({question})}
                        value={this.state.question}
                    />
                    <TextInput
                        placeholder={"Answer"}
                        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                        onChangeText={(answer) => this.setState({answer})}
                        value={this.state.answer}
                    />
                    <List>
                        {this.state.cards.map( (i, val) =>
                            <ListItem key={val} thumbnail>
                                <Left />
                                <Body>
                                <Text>{i.question}</Text>
                                <Text note numberOfLines={1}>{i.answer}</Text>
                                </Body>

                                <Right>
                                    <TouchableOpacity onPress={() => this._onPressButton(i.id)}>
                                    <Text style={{ color: 'red'}}>
                                        Delete
                                    </Text>

                                    </TouchableOpacity>
                                </Right>
                            </ListItem>
                        )}
                    </List>
                </Content>
            </Container>
        );
    }
}

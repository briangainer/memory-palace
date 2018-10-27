import React, { Component } from 'react';
import { TextInput } from 'react-native';
import firebase from 'firebase';
require("firebase/firestore");

import { Container, Title, Header, Content, List, ListItem, Thumbnail, Text, Left, Body, Right, Button } from 'native-base';
export default class ListThumbnailExample extends Component {
      constructor(props) {
      super(props);
      this.state = {
        cards: [
            {'question': 'This is question 1', 'answer': 'This is answer 1'},
            {'question': 'This is question 2', 'answer': 'This is answer 2'},
            {'question': 'This is question 3', 'answer': 'This is answer 3'},
            {'question': 'This is question 4', 'answer': 'This is answer 4'}
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
                      cities.push(doc.data());
                  });
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
                            </ListItem>
                        )}
                    </List>
                </Content>
            </Container>
        );
    }
}

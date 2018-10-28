import React from 'react';
import { AR } from 'expo';
import { View } from 'react-native'
import { Button, Text} from 'native-base'
// Let's alias ExpoTHREE.AR as ThreeAR so it doesn't collide with Expo.AR.
import ExpoTHREE, { AR as ThreeAR, THREE } from 'expo-three';
// Let's also import `expo-graphics`
// expo-graphics manages the setup/teardown of the gl context/ar session, creates a frame-loop, and observes size/orientation changes.
// it also provides debug information with `isArCameraStateEnabled`
import { View as GraphicsView } from 'expo-graphics';
import firebase from 'firebase';
require("firebase/firestore");

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cards: [
            ]
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


    componentDidMount() {
        // Turn off extra warnings
        THREE.suppressExpoWarnings()
    }

    render() {
        // You need to add the `isArEnabled` & `arTrackingConfiguration` props.
        // `isArRunningStateEnabled` Will show us the play/pause button in the corner.
        // `isArCameraStateEnabled` Will render the camera tracking information on the screen.
        // `arTrackingConfiguration` denotes which camera the AR Session will use.
        // World for rear, Face for front (iPhone X only)
        return (
            <View style={{ flex: 1 }}>
            <GraphicsView
                style={{ flex: 1 }}
                onContextCreate={this.onContextCreate}
                onRender={this.onRender}
                onResize={this.onResize}
                isArEnabled
                isArRunningStateEnabled
                isArCameraStateEnabled
                arTrackingConfiguration={AR.TrackingConfigurations.World}
            />
                <Button full disabled={this.state.cards.length === 0} onPress={this.placeCard}>
                    <Text>
                        Place Card
                    </Text>
                </Button>
            </View>
        );
    }

    placeCard = () => {
        const qs = this.state.cards
        const q = qs.shift()
        this.setState({ cards: qs })

        const font = new THREE.Font( require( "../assets/helvetiker_regular.typeface.json" ) );
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const textGeometry = new THREE.TextGeometry(q.question, {
            font: font,
            size: 0.01,
            height: 0.001
        });

        const textGeometry2 = new THREE.TextGeometry(q.answer, {
            font: font,
            size: 0.01,
            height: 0.001
        });
        const textMesh2 = new THREE.Mesh(textGeometry2, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        const pos = this.camera.getWorldPosition();

        textMesh.position.set(pos.x - 0.04, pos.y , pos.z-0.4);
        textMesh2.position.set(pos.x - 0.04, pos.y-0.6 , pos.z-0.4);

        this.scene.add(textMesh)
        this.scene.add(textMesh2)
    }

    // When our context is built we can start coding 3D things.
    onContextCreate = async ({ gl, scale: pixelRatio, width, height }) => {
        // This will allow ARKit to collect Horizontal surfaces
        AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);

        // Create a 3D renderer
        this.renderer = new ExpoTHREE.Renderer({
            gl,
            pixelRatio,
            width,
            height,
        });

        // We will add all of our meshes to this scene.
        this.scene = new THREE.Scene();
        // This will create a camera texture and use it as the background for our scene
        this.scene.background = new ThreeAR.BackgroundTexture(this.renderer);
        // Now we make a camera that matches the device orientation.
        // Ex: When we look down this camera will rotate to look down too!
        this.camera = new ThreeAR.Camera(width, height, 0.01, 1000);
        // Make a cube - notice that each unit is 1 meter in real life, we will make our box 0.1 meters
        // Setup a light so we can see the cube color
        // AmbientLight colors all things in the scene equally.
        this.scene.add(new THREE.AmbientLight(0xffffff));
    };

    // When the phone rotates, or the view changes size, this method will be called.
    onResize = ({ x, y, scale, width, height }) => {
        // Let's stop the function if we haven't setup our scene yet
        if (!this.renderer) {
            return;
        }
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setPixelRatio(scale);
        this.renderer.setSize(width, height);
    };

    // Called every frame.
    onRender = () => {
        // Finally render the scene with the AR Camera
        this.renderer.render(this.scene, this.camera);
    };
}



/*
import React from 'react';
import { AR } from 'expo';
import { View } from 'react-native'
import { Button, Text } from 'native-base'
// Let's alias ExpoTHREE.AR as ThreeAR so it doesn't collide with Expo.AR.
import ExpoTHREE, { AR as ThreeAR, THREE } from 'expo-three';
// Let's also import `expo-graphics`
// expo-graphics manages the setup/teardown of the gl context/ar session, creates a frame-loop, and observes size/orientation changes.
// it also provides debug information with `isArCameraStateEnabled`
import { View as GraphicsView } from 'expo-graphics';

export default class App extends React.Component {
    componentDidMount() {
        // Turn off extra warnings
        THREE.suppressExpoWarnings()
    }

    render() {
        // You need to add the `isArEnabled` & `arTrackingConfiguration` props.
        // `isArRunningStateEnabled` Will show us the play/pause button in the corner.
        // `isArCameraStateEnabled` Will render the camera tracking information on the screen.
        // `arTrackingConfiguration` denotes which camera the AR Session will use.
        // World for rear, Face for front (iPhone X only)
        return (
            <View style={{ flex: 1 }}>

                <GraphicsView
                    style={{ flex: 1 }}
                    onContextCreate={this.onContextCreate}
                    onRender={this.onRender}
                    onResize={this.onResize}
                    isArEnabled
                    isArRunningStateEnabled
                    isArCameraStateEnabled
                    arTrackingConfiguration={AR.TrackingConfigurations.World}
                />
                <Button onPress={this.placeQuestion}>
                    <Text>Click Me!</Text>
                </Button>
            </View>
        );
    }

    placeQuestion = () => {
        console.log(this.camera.position)
    }

    // When our context is built we can start coding 3D things.
    onContextCreate = async ({ gl, scale: pixelRatio, width, height }) => {
        // This will allow ARKit to collect Horizontal surfaces
        AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);

        // Create a 3D renderer
        this.renderer = new ExpoTHREE.Renderer({
            gl,
            pixelRatio,
            width,
            height,
        });

        // We will add all of our meshes to this scene.
        this.scene = new THREE.Scene();
        // This will create a camera texture and use it as the background for our scene
        this.scene.background = new ThreeAR.BackgroundTexture(this.renderer);
        // Now we make a camera that matches the device orientation.
        // Ex: When we look down this camera will rotate to look down too!
        this.camera = new ThreeAR.Camera(width, height, 0.01, 1000);
        // Make a cube - notice that each unit is 1 meter in real life, we will make our box 0.1 meters
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        // Simple color material
        const material = new THREE.MeshPhongMaterial({
            color: this.randomColor()
        })

        // Combine our geometry and material
        this.cube = new THREE.Mesh(geometry, material);
        // Place the box 0.4 meters in front of us.
        this.cube.position.z = -0.4
        // Add the cube to the scene
        this.scene.add(this.cube);
        // Setup a light so we can see the cube color
        // AmbientLight colors all things in the scene equally.
        this.scene.add(new THREE.AmbientLight(0xffffff));




        this.questionGroup = new THREE.Group()
        this.answerGroup = new THREE.Group()

        const font = new THREE.Font( require( "../assets/helvetiker_regular.typeface.json" ) );
        var textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        var textGeometry = new THREE.TextGeometry('hey', {
            font: font,
            size: 0.01,
            height: 0.001
        });
        var textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-0.1, 0.07, -0.3)
        this.questionGroup.add(textMesh);
        this.scene.add(this.questionGroup)
    };

    // When the phone rotates, or the view changes size, this method will be called.
    onResize = ({ x, y, scale, width, height }) => {
        // Let's stop the function if we haven't setup our scene yet
        if (!this.renderer) {
            return;
        }
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setPixelRatio(scale);
        this.renderer.setSize(width, height);
    };

    // Called every frame.
    onRender = () => {
        // Finally render the scene with the AR Camera
        this.renderer.render(this.scene, this.camera);
    };

    randomColor = () => {
        let allowed = "ABCDEF0123456789", S = "#";
        while(S.length < 7){
            S += allowed.charAt(Math.floor((Math.random()*16)+1));
        }
        return S;
    }


}
*/
/*
<GraphicsView
    style={{ flex: 1 }}
    onContextCreate={this.onContextCreate}
    onRender={this.onRender}
    onResize={this.onResize}
    isArEnabled
    isArRunningStateEnabled
    isArCameraStateEnabled
    arTrackingConfiguration={AR.TrackingConfigurations.World}
/>
*/
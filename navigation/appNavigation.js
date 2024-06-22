import { NavigationContainer } from '@react-navigation/native';
import React, { useState, useCallback, useRef, useEffect }  from 'react';
import {Button, View, Alert } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PublicSpaceScreen from '../screens/PublicSpaceScreen';
import LoginScreen from '../screens/LoginScreen';
import LoginScreen2 from '../screens/LoginScreen2';
import TestScreen from '../screens/TestScreen';
import HomeScreen from '../screens/HomeScreen';
import SpaceScreen from '../screens/SpaceScreen';
import Player from '../components/Player';
import YoutubePlayer from "react-native-youtube-iframe";
import {socket} from '../services/socket';
import {useRecoilState} from 'recoil';
import {currentUserState,currentSongInfoState} from '../atoms/userAtom';
import TrackPlayer, { Capability, State } from 'react-native-track-player';
import axios from 'axios';

const Stack = createNativeStackNavigator();

export default function appNavigation() {
    const [playing, setPlaying] = useState(false);
    const [currentUser,setCurrentUser] = useRecoilState(currentUserState);
    const [currentSongInfo,setCurrentSongInfo] = useRecoilState(currentSongInfoState);
    
    const onStateChange = useCallback((state) => {    
        if (state === "ended") {      
            setPlaying(false);      
            Alert.alert("video has finished playing!");    
        }  
    }, []);

    const togglePlaying = useCallback(() => {    
        setPlaying(!playing);  
    }, []);

    // useEffect(()=>{
    //     if(currentUser){
    //       // updateSpaceToUser(params.room);
    //       socket.emit('add-user',currentUser._id)
    //     }
    // },[currentUser]);

    const resetPlayer = async() => {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.reset();

    }
    

    const initPlayer = async() => {
        console.log("called");
        try{
            await TrackPlayer.setupPlayer();
        }catch(ex){
            console.log(ex)
        }
        await TrackPlayer.updateOptions({
            // Media controls capabilities
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
                Capability.Stop,
            ],

            // Capabilities that will show up when the notification is in the compact form on Android
            compactCapabilities: [Capability.Play, Capability.Pause,Capability.SkipToNext,
               Capability.SkipToPrevious,],

        });
        await TrackPlayer.reset();
        const {data} = await axios.post('http://192.168.1.9:3333/getAudio',{
            url:'https://www.youtube.com/watch?v=fRD_3vJagxk'
        });
        // console.log(data)
        const track1 = {
            url: data?.url,
            title: data?.info?.videoDetails?.title,
            artist: data?.info?.videoDetails?.author?.name,
            album: data?.info?.videoDetails?.author?.name,
            duration:data?.info?.videoDetails?.lengthSeconds,
            date:data?.info?.videoDetails?.publishDate?.split("T")[0],
            id:data?.info?.videoDetails?.videoId,
        };
        setCurrentSongInfo(data?.info?.videoDetails);
        await TrackPlayer.add(track1);

        await TrackPlayer.play();
        const state = await TrackPlayer.getState();
        console.log(state)
        const tracks = await TrackPlayer.getQueue();
        console.log(`First title: ${tracks}`);
        if (state === State.Playing) {
            console.log('The player is playing');
        };
    }

    const checkState = async() => {
        const state = await TrackPlayer.getState();
        console.log(state)
    }

    useEffect(()=>{
        initPlayer();
        // resetPlayer();
        // setInterval(()=>{
        //  // checkState()
        // },2000)
    },[])

    return (
    <>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen name="PublicSpace" component={PublicSpaceScreen} />
            <Stack.Screen name="Login" component={LoginScreen2} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Space" component={SpaceScreen} />
            <Stack.Screen name="Test" component={TestScreen} />
            
        </Stack.Navigator>
      </NavigationContainer>
      <Player TrackPlayer={TrackPlayer} />
    </>
    );
  }
import { NavigationContainer } from '@react-navigation/native';
import React, { useState, useCallback, useRef, useEffect }  from 'react';
import {Button, View, Alert, AppState  } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PublicSpaceScreen from '../screens/PublicSpaceScreen';
import LoginScreen2 from '../screens/LoginScreen2';
import HomeScreen from '../screens/HomeScreen';
import SpaceScreen from '../screens/SpaceScreen';
import SettingScreen from '../screens/SettingScreen';
import Player from '../components/Player';
import YoutubePlayer from "react-native-youtube-iframe";
import NewUserAlert from '../components/NewUserAlert';
import {socket} from '../services/socket';
import {useRecoilState,useRecoilValue} from 'recoil';
import {currentUserState,currentSongInfoState,
    hideState,currentSpaceState,newUserDataState,
    numberOfUsersState,queueState,youtubePlayerState,
    globalPlayerRefState,songPlayingState,newMessageState,
    playingState,chatsState} from '../atoms/userAtom';
import {getSpaceWithCode,getQueueOfSpace} from '../utils/ApiRoutes';
import TrackPlayer, { Capability, State, Event } from 'react-native-track-player';
import axios from 'axios';
import BackgroundTimer from 'react-native-background-timer';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Stack = createNativeStackNavigator();

const useTrackPlayerErrorHandling = (onError) => {
  useEffect(() => {
    const onErrorListener = TrackPlayer.addEventListener('playback-error', (error) => {
      console.log('TrackPlayer error:', error);
      onError(error);
    });

    return () => {
      onErrorListener.remove();
    };
  }, [onError]);
};

export default function appNavigation() {
    const routeNameRef = useRef();
    const navigationRef = useRef(); 
    const appState = useRef(AppState.currentState);
    var interval

    const [songPlaying,setSongPlaying] = useRecoilState(songPlayingState);
    const [playing, setPlaying] = useRecoilState(playingState);
    const [currentUser,setCurrentUser] = useRecoilState(currentUserState);
    const [currentSpace,setCurrentSpace] = useRecoilState(currentSpaceState);
    const [currentSongInfo,setCurrentSongInfo] = useRecoilState(currentSongInfoState);
    const [newUserData,setNewUserData] = useRecoilState(newUserDataState);
    const [numberOfUsers,setNumberOfUsers] = useRecoilState(numberOfUsersState);
    const [youtubePlayer,setYoutubePlayer] = useRecoilState(youtubePlayerState);
    const [globalPlayerRef,setGlobalPlayerRef] = useRecoilState(globalPlayerRefState);
    const [chats,setChats] = useRecoilState(chatsState);
    const [hide,setHide] = useRecoilState(hideState);
    const [newMessage,setNewMessage] = useRecoilState(newMessageState);
    const [getUsersTrue,setGetUsersTrue] = useState(false);
    const [queue,setQueue] = useRecoilState(queueState);
    const [playerState, setPlayerState] = useState(State.None);
    const intervalRef = useRef(null);
    const [playSongRemote,setPlaySongRemote] = useState(false);
    const [pauseSongRemote,setPauseSongRemote] = useState(false);
    const [syncToUser,setSyncToUser] = useState('');
    const [tempSeek,setTempSeek] = useState('');
    const [syncToUserId,setSyncToUserId] = useState('');
    const [newMessageTemp,setNewMessageTemp] = useState(false);

    useEffect(()=>{
        const check = async() => {
            if(pauseSongRemote){
                if(currentSpace){
                  socket.emit("pause-song",{spaceCode:currentSpace?.code});
                }
                setPauseSongRemote(false);
            }
        }
        check()
    },[pauseSongRemote]);

    useEffect(()=>{
        const check = async() => {
            if(playSongRemote){
                if(currentSpace){
                    const duration = await TrackPlayer.getPosition();
                    socket.emit("play-song",{spaceCode:currentSpace?.code,seekTo:duration,timestamp:Date.now()});
                }
                setPlaySongRemote(false);
            }
        }
        check();
    },[playSongRemote])

    const addRemoteListeners = async() => {
        try{
            await TrackPlayer.setupPlayer()
        }catch(ex){
            console.log(ex);
        }

        TrackPlayer.addEventListener(Event.RemotePlay, async() => {
            setPlaySongRemote(true)
        });

        TrackPlayer.addEventListener(Event.RemotePause, async() => {
            setPauseSongRemote(true);
        });
        console.log('Remote listeners added successfully.');
    }

    const handleError = (error) => {
        // Handle the error, e.g., show a notification, log it, or perform other actions
        console.log('An error occurred:', error);
        if(error?.code === 'android-io-network-connection-failed'){
            if(queue.length > 1 && (queue[0].url === currentSongInfo?.url)){
                playSongFromQueue(queue[1]);
                let queueData = [...queue];
                queueData.shift();
                setQueue(queueData);
                socket.emit('remove-first-song-in-queue',{spaceCode:currentSpace.code,url:queue[0].url});
                setTimeout(()=>{
                    socket.emit("get-queue",{spaceCode:currentSpace?.code})
                },1000)
            }
        }
    };

    useTrackPlayerErrorHandling(handleError);

    useEffect(()=>{
        addRemoteListeners()
    },[]);

    const _handleAppStateChange = (nextAppState) => {
        if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
        ) {
            appState.current = nextAppState;
            console.log("App has come to the foreground!");
            //clearInterval when your app has come back to the foreground
            BackgroundTimer.clearInterval(interval)
            BackgroundTimer.stopBackgroundTimer();
        }else{
            //app goes to background
            console.log('app goes to background')
            //tell the server that your app is still online when your app detect that it goes to background
            interval = BackgroundTimer.setInterval(()=>{
              // console.log('connection status ', socket.connected)
              socket.emit('online')
            },5000)
            appState.current = nextAppState;
            console.log("AppState", appState.current);
        }
    }

    useEffect (() => {
        AppState.addEventListener("change", _handleAppStateChange);

        return () => {
          // AppState.removeEventListener("change", _handleAppStateChange);
        };
    },[])
    
    useEffect(() => {
        const state = navigationRef.current.getRootState();
        routeNameRef.current = state ? state.routes[state.index].name : null;
    }, []);

    const fetchSpaceAndSet = async(id) => {
        const {data} = await axios.get(`${getSpaceWithCode}/${currentUser?.inSpace}`);
        if(data?.status){
            setCurrentSpace(data?.space);
        }
    }

    useEffect(()=>{
        if(currentUser){
          socket.emit('add-user',currentUser._id);
          if(currentUser?.inSpace && !currentSpace){
            fetchSpaceAndSet(currentUser?.inSpace);
          }
        }
    },[currentUser]);

    const checkQueue = async(code) => {
        const {data} = await axios.post(getQueueOfSpace,{spaceCode:code});

        if(data?.status && data?.queue?.length > 0){
            // console.log("ran",data?.queue[0]);
            if((data?.queue[0]?.info?.videoDetails?.videoId !== currentSongInfo?.videoId) || !currentSongInfo){
                playSongFromQueue(data?.queue[0]);
            }
            setQueue(data?.queue);
        }
    }

    useEffect(()=>{
        if(queue?.length > 0){
            if(playerState?.state === 'ended' && queue[0]?.info?.videoDetails && ( queue[0]?.info?.videoDetails?.videoId === currentSongInfo?.videoId ) && queue.length > 1){
                console.log("I ran","98 appNavigation")
                playSongFromQueue(queue[1]);
                let queueData = [...queue];
                queueData.shift();
                setQueue(queueData);
                socket.emit('remove-first-song-in-queue',{spaceCode:currentSpace.code,url:queue[0].url});
                setTimeout(()=>{
                    socket.emit("get-queue",{spaceCode:currentSpace?.code})
                },1000)
            }else if(playerState?.state === 'ended' && (queue[0].url === currentSongInfo?.url) && queue.length > 1){
                console.log("I ran","158 appNavigation")
                playSongFromQueue(queue[1]);
                let queueData = [...queue];
                queueData.shift();
                setQueue(queueData);
                socket.emit('remove-first-song-in-queue',{spaceCode:currentSpace.code,url:queue[0].url});
                setTimeout(()=>{
                    socket.emit("get-queue",{spaceCode:currentSpace?.code})
                },1000)
            }else{
                if(queue[0]?.info?.videoDetails && ( queue[0]?.info?.videoDetails?.videoId !== currentSongInfo?.videoId )){
                    playSongFromQueue(queue[0]);
                }else if(!queue[0]?.info?.videoDetails && (queue[0]?.url !== currentSongInfo?.url)){
                    playSongFromQueue(queue[0]);
                }

            }
        }
    },[queue]);

    useEffect(()=>{
        if(currentSpace?.code){
            socket.emit('add-user-to-space',{
                spaceCode:currentSpace?.code,
                user:currentUser
            })
            checkQueue(currentSpace?.code);
        }
        return () => {
            if(currentSpace?.code){
                socket.emit('remove-user-from-space',{
                    spaceCode:currentSpace?.code,
                    user:currentUser
                })
            }
            TrackPlayer.reset();
        }
    },[currentSpace]);


    const emitCurrentSeekPosition = async () => {
      try {
        const currentPosition = await TrackPlayer.getPosition(); 
        const currentTimestamp = Date.now();

        socket.emit('sync-position', {
          spaceCode: currentSpace.code,
          timestamp: currentTimestamp,
          position: currentPosition,
          queue
        });
      } catch (error) {
        console.error('Error getting current position:', error);
      }
    };

    const playSongFromSocket = async(data,timestamp,queueData,position) => {
        console.log("I ran",197)
        if(currentSongInfo && ( (queueData[0]?.info?.videoDetails && (queueData[0]?.info?.videoDetails?.videoId === currentSongInfo?.videoId)) || (queueData[0]?.url === currentSongInfo?.url) )){
            syncSong(position,timestamp);
            return;
        }
        setQueue(queueData)
        await TrackPlayer.reset();

        if(data?.info?.videoDetails){
            const track1 = {
                url: data?.url,
                title: data?.info?.videoDetails?.title,
                artist: data?.info?.videoDetails?.author?.name,
                album: data?.info?.videoDetails?.author?.name,
                duration:data?.info?.videoDetails?.lengthSeconds,
                date:data?.info?.videoDetails?.publishDate?.split("T")[0],
                id:data?.info?.videoDetails?.videoId,
                artwork:data?.info?.videoDetails?.thumbnails?.[1]?.url
            };
            setCurrentSongInfo(data?.info?.videoDetails);
            if(data?.youtube){
                setYoutubePlayer(data?.url);
            }else{
                setYoutubePlayer('');
                await TrackPlayer.add([track1],0);
                await TrackPlayer.seekTo(0);
                await TrackPlayer.play();

                const currentTimestamp = Date.now();
                const delay = currentTimestamp - timestamp;
                console.log('sync-song run',delay/1000,timestamp,currentTimestamp,position,position+(delay/1000));
                if (delay > 0) {
                    setTimeout(() => {
                      TrackPlayer.seekTo(position+(delay / 1000)); // Convert delay to seconds
                    }, 0);
                }
            }

        }else{
            setYoutubePlayer('');

            setCurrentSongInfo(data);

            await TrackPlayer.add([{...data,artwork:data?.cover}],0);
            await TrackPlayer.seekTo(0);

            const currentTimestamp = Date.now();
            const delay = currentTimestamp - timestamp;
            console.log('sync-song run',delay/1000,timestamp,currentTimestamp,position,position+(delay/1000));
            if (delay > 0) {
                setTimeout(async() => {
                    await TrackPlayer.seekTo(position+(delay / 1000)); // Convert delay to seconds
                    await TrackPlayer.play();
                }, 0);
            }else{
                await TrackPlayer.play();
            }
        }
        
        
    }

    const playSongFromQueue = async(data) => {
        console.log("I ran 228")
        await TrackPlayer.reset();

        
        if(data?.info?.videoDetails){
            const track1 = {
                url: data?.url,
                title: data?.info?.videoDetails?.title,
                artist: data?.info?.videoDetails?.author?.name,
                album: data?.info?.videoDetails?.author?.name,
                duration:data?.info?.videoDetails?.lengthSeconds,
                date:data?.info?.videoDetails?.publishDate?.split("T")[0],
                id:data?.info?.videoDetails?.videoId,
                artwork:data?.info?.videoDetails?.thumbnails?.[1]?.url
            };
            setCurrentSongInfo(data?.info?.videoDetails);
            if(data?.youtube){
                setYoutubePlayer(data?.url);
            }else{
                setYoutubePlayer('');
                await TrackPlayer.add([track1],0);
                await TrackPlayer.seekTo(0);
                await TrackPlayer.play();
            }
        }else{
            setYoutubePlayer('');
            const track1 = {
                url: data?.url,
                title: data?.title,
                artist: data?.artist,
                album: data?.album,
                duration:data?.duration,
                artwork:data?.cover,
                id:data?.id,
            };
            setCurrentSongInfo(data);
            await TrackPlayer.add([track1],0);
            await TrackPlayer.seekTo(0);
            await TrackPlayer.play();

        }

    }

    const syncSong = async(position,timestamp) => {
        const currentTimestamp = Date.now();
        const delay = (currentTimestamp - timestamp) / 1000;
        console.log('sync-song-run-2',delay,timestamp,currentTimestamp,position);

        const seekPosition = position + delay;
        TrackPlayer.seekTo(seekPosition);
        TrackPlayer.play()
    }

    const getUsersInRoom = async() => {
        socket.emit('get-users-in-room',{
            spaceCode:currentSpace.code
        })
    };

    useEffect(()=>{
        if(getUsersTrue){
            getUsersInRoom();
            setGetUsersTrue(false);
        }
    },[getUsersTrue])

    const syncToUserFunc = async() => {
        const currentPosition = await TrackPlayer.getPosition(); 
        const tempQueue = queue.length > 0 ? queue : [];
        socket.emit("sync-to-new-user",{
            spaceCode:currentSpace?.code,
            timestamp:Date.now(),
            position:currentPosition,
            queue:tempQueue,
            userId:syncToUser
        })
        console.log('ran2');
    }

    useEffect(()=>{
        if(syncToUser){
            if(currentSpace?.users[0]?._id === currentUser?._id){
                console.log("ran",290)
                syncToUserFunc();
            }
        }
    },[syncToUser])

    const seekTime = async() => {
        setGlobalPlayerRef(tempSeek);
        setSongPlaying(true);
        setPlaying(true);
        setTempSeek('');   
    }

    useEffect(()=>{
        if(tempSeek){
            seekTime()
        }
    },[tempSeek])

    useEffect(()=>{
        if(socket){
            socket.on("new-user",(user)=>{
                setNewUserData({...user,status:'New User :'});
                setSyncToUser(user?._id);
                setGetUsersTrue(true);
            })
            socket.on('refetch-space',()=>{
                fetchSpaceAndSet();
                setGetUsersTrue(true);
            })
            socket.on('user-left',(user)=>{
                setNewUserData({...user,status:'User Left :'});
                setGetUsersTrue(true);
            })
            socket.on('fetch-song',({data,timestamp})=>{
                playSongFromSocket(data,timestamp,[],0);
            })
            socket.on('sync-position',({position,timestamp,queue})=>{
                console.log({...queue[0],cover:''});
                if(queue?.length > 0){
                    playSongFromSocket(queue[0],timestamp,queue,position);
                }else{
                    syncSong(position,timestamp);
                }
            })
            socket.on('number-of-users-in-room',({numClients})=>{
                setNumberOfUsers(numClients);
            })
            socket.on('pause-song-remote',async()=>{
                await TrackPlayer.pause();
                setSongPlaying(false);
                setPlaying(false);
            })
            socket.on("play-song-remote",async({seekTo,timestamp})=>{
                const time = Date.now()
                const delay = (time-timestamp)/1000;
                if(delay > 0){
                    await TrackPlayer.seekTo(seekTo+delay);
                    await TrackPlayer.play();
                    setTempSeek(seekTo+delay);
                }else{
                    await TrackPlayer.seekTo(seekTo);
                    await TrackPlayer.play();
                    setTempSeek(seekTo);
                }
                    
            })
            socket.on("update-queue",({queue})=>{
                setQueue(queue);
            })
            socket.on('sync-audio-song',({userId})=>{
                setSyncToUserId(userId);
            })
            socket.on('sync-audio-song-response',({position,userId})=>{
                TrackPlayer.seekTo(position);
            })

            socket.on('new-message',(data)=>{
                setNewMessageTemp(data);
                setNewMessage(data?.message);
                setTimeout(()=>{
                    setNewMessage('');
                },5000)
            })
        }

        return () => {
            if(socket){
                socket.off("new-user");
                
                socket.emit('remove-user-from-space',{
                    spaceCode:currentSpace?.code,
                    user:currentUser
                })
            }
        }
    },[socket]);

    useEffect(()=>{
        if(newMessageTemp){
            const tempChats = [...chats,newMessageTemp];   
            setChats(tempChats);
            setNewMessageTemp('');
        }
    },[newMessageTemp])

    const getPositionAndSend = async() => {
        const position = await TrackPlayer.getPosition();
        // if((currentUser?._id === currentSpace?.users[0]?._id) || (currentUser?._id === currentSpace?.users[1]?._id)){
            socket.emit('sync-audio-song-response',{
                userId:syncToUserId,position,spaceCode:currentSpace?.code
            })
        // }
        setSyncToUserId("");
    }

    useEffect(()=>{
        if(syncToUserId){
            getPositionAndSend();
        }
    },[syncToUserId])

    
    const test = async() => {
        const queue = await TrackPlayer.getQueue();
        console.log(playerState?.state,' ',queue);    
    }

    useEffect(()=>{
        // test()
        if (playerState.state === "playing" && (currentSpace?.users?.[0]?._id === currentUser?._id)) {
          // emitCurrentSeekPosition();
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
        if((playerState?.state === 'ended') 
            && currentSpace && queue?.length > 1){
            playSongFromQueue(queue[1]);
            let queueData = [...queue];
            queueData.shift();
            setQueue(queueData);
            socket.emit('remove-first-song-in-queue',{spaceCode:currentSpace.code,url:queue[0].url});
            setTimeout(()=>{
                socket.emit("get-queue",{spaceCode:currentSpace?.code})
            },1000)
        }else if(playerState?.status === 'ended'){
            resetPlayer();
        }

        return () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        };
    },[playerState])

    useEffect(()=>{
        const onPlaybackStateChange = (state) => {

          setPlayerState(state);
        };

        const playbackStateListener = TrackPlayer.addEventListener(
          'playback-state',
          onPlaybackStateChange
        );

        return () => {
          playbackStateListener.remove();
        };
    },[])

    const resetPlayer = async() => {
        await TrackPlayer.reset();
    }
    

    const initPlayer = async() => {
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
        
    }

    const saveUserData = async() => {
        await AsyncStorage.setItem("Rplayer-user-session",JSON.stringify(currentUser));
    }

    useEffect(()=>{
        if(currentUser){
            saveUserData();
        }
    },[currentUser])
    
    const checkAuth = async() => {
        if(AsyncStorage.getItem("Rplayer-user-session")){
            const data = await AsyncStorage.getItem("Rplayer-user-session");
            const parsedData = JSON.parse(data);
            setCurrentUser(parsedData);
        }
    }

    useEffect(()=>{
        checkAuth();
        initPlayer();
    },[]);

    return (
    <>
      <NavigationContainer 
      ref={navigationRef}
      onStateChange={() => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current.getCurrentRoute().name;
        routeNameRef.current = currentRouteName;

        if(currentRouteName === 'Space'){
            setHide(true);
        }else{
            setHide(false);
        }

      }} >
        <Stack.Navigator initialRouteName={'Home'} screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen name="PublicSpace" component={PublicSpaceScreen} />
            <Stack.Screen name="Login" component={LoginScreen2} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Space" component={SpaceScreen} />
            <Stack.Screen name="Settings" component={SettingScreen} />
            
        </Stack.Navigator>
      </NavigationContainer>
      {
        currentUser &&
        <>
            <Player TrackPlayer={TrackPlayer} />
        </>
      }
      <NewUserAlert />
    </>
    );
  }
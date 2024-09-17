import LinearGradient from 'react-native-linear-gradient';
import {Image,View,Text,ScrollView,TouchableOpacity,StatusBar,
	StyleSheet,Pressable} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context';
import Navbar from '../components/Navbar';
import {useRecoilState} from 'recoil';
import {currentSpaceState,currentSongInfoState,
	currentUserState,numberOfUsersState,
	songPlayingState,queueState,youtubePlayerState,
	playingState,globalPlayerRefState} from '../atoms/userAtom';
import {updateInSpace,getQueueOfSpace} from '../utils/ApiRoutes';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/Ionicons';
import Icon3 from 'react-native-vector-icons/FontAwesome5';
import Icon4 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon6 from 'react-native-vector-icons/Foundation';
import TrackPlayer, {useProgress,State,usePlaybackState} from 'react-native-track-player';
import {useState,useEffect,useRef} from 'react';
import {socket} from '../services/socket';
import axios from 'axios';
import SongsTab from '../components/SongsTab';
import UserListComponent from '../components/UserListComponent';
import QueueComponent from '../components/QueueComponent';
import ChatComponent from '../components/ChatComponent';
import NewMessageComponent from '../components/NewMessageComponent';
import MoreOptionsComponent from '../components/MoreOptionsComponent';
import YoutubePlayer from 'react-native-youtube-iframe';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {particleImage2 as particleImage3,particleImage3 as particleImage2,musicImage} 
	from '../utils/imageEncoded';


export default function SpaceScreen({
	navigation
}) {
	const { position, buffered, duration } = useProgress()
	const [songPlaying,setSongPlaying] = useRecoilState(songPlayingState);
	const [playing, setPlaying] = useRecoilState(playingState);
	const [currentSpace,setCurrentSpace] = useRecoilState(currentSpaceState);
	const [currentSongInfo,setCurrentSongInfo] = useRecoilState(currentSongInfoState);
  const [numberOfUsers,setNumberOfUsers] = useRecoilState(numberOfUsersState);
	const [currentUser,setCurrentUser] = useRecoilState(currentUserState);
  const [youtubePlayer,setYoutubePlayer] = useRecoilState(youtubePlayerState);
  const [globalPlayerRef,setGlobalPlayerRef] = useRecoilState(globalPlayerRefState);
	const [spaceName,setSpaceName] = useState('');
	const [owner,setOwner] = useState('');
	const [openSongsTab,setOpenSongsTab] = useState(false);
	const [openUsersTab,setOpenUsersTab] = useState(false);
	const [queue,setQueue] = useRecoilState(queueState);
	const [usersInSpace,setUsersInSpace] = useState([]);
 	const playerState = usePlaybackState();
 	const [previousVolume, setPreviousVolume] = useState(1.0);
 	const [openQueueTab,setOpenQueueTab] = useState(false);
 	const [openChatTab,setOpenChatTab] = useState(false);
 	const [openMoreOptions,setOpenMoreOptions] = useState(false);
 	const [isMuted,setIsMuted] = useState(false);
  	const playerRef = useRef(null);
	const [videoId, setVideoId] = useState(null);
 	const [sliderWidth, setSliderWidth] = useState(0);

 	useEffect(()=>{
 		if(globalPlayerRef > 0 && playerRef?.current){
 			playerRef?.current?.seekTo(globalPlayerRef);
 		}
 		
 	},[globalPlayerRef])

 	const onStateChange = async(state) => {
	    if (state === 'ended') {
	      	setPlaying(false);
	      	setSongPlaying(false)
	      	
	      	if(currentSpace && queue?.length > 1){

	      		playSongFromQueue(queue[1]);
	            let queueData = [...queue];
	            queueData.shift();
	            
	            setQueue(queueData);
	            socket.emit('remove-first-song-in-queue',{spaceCode:currentSpace.code,url:queue[0].url});
	            setTimeout(()=>{
	                socket.emit("get-queue",{spaceCode:currentSpace?.code})
	            },1000)
	      	}
	    }else if(state === 'paused'){
	      	if(playing === true && currentSpace){
              socket.emit("pause-song",{spaceCode:currentSpace.code});
            }
	      	setSongPlaying(false)
	      	setPlaying(false);
	    }else if(state === 'playing'){
	    	if(playing === false){
			    if(currentSpace){
			        const duration = await playerRef?.current?.getCurrentTime();
			        socket.emit("play-song",{spaceCode:currentSpace.code,seekTo:duration,timestamp:Date.now()});
				}
	    	}
	      	setSongPlaying(true);
	      	setPlaying(true);
	    }
	};

	const togglePlaying = () => {
	    const action = playing ? 'pause' : 'play';
	    setPlaying((prev) => !prev);
	    socket.emit('video-action', { action });
	};

	const seekTo = (seconds) => {
	    playerRef.current.seekTo(seconds, true);
	    socket.emit('video-action', { action: 'seek', time: seconds });
	};

	useEffect(() => {
	    const getInitialVolume = async () => {
	      const volume = await TrackPlayer.getVolume();
	      setPreviousVolume(volume);
	    };

	    getInitialVolume();
	}, []);

	const toggleMute = async () => {
	    if (isMuted) {
	      await TrackPlayer.setVolume(1); // Restore previous volume
	    } else {
	      const currentVolume = await TrackPlayer.getVolume();
	      setPreviousVolume(currentVolume);
	      await TrackPlayer.setVolume(0.0); // Mute
	    }
	    setIsMuted(!isMuted);
	};

	const playSongFromQueue = async(data) => {
        console.log("called 123");
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
		        await TrackPlayer.play();
		        socket.emit("sync-audio-song",{
		          spaceCode: currentSpace.code,
		          userId:currentUser?._id
		        })
		        console.log("I dhan ran")
	        }
        }else{
	        setYoutubePlayer('');
	        setCurrentSongInfo(data);
	        await TrackPlayer.add([{...data,artwork:data?.cover}],0);
	        await TrackPlayer.play();
        }
    }

	const checkQueue = async(code) => {
		const {data} = await axios.post(getQueueOfSpace,{spaceCode:code});

		if(data?.status && data?.queue?.length > 0){
			if(data?.queue[0]?.info?.videoDetails?.videoId !== currentSongInfo?.videoId){
				playSongFromQueue(data?.queue[0]);
			}
			setQueue(data?.queue);
		}
	}

	useEffect(()=>{
		if(openQueueTab) checkQueue();
	},[openQueueTab])

	useEffect(()=>{
		const checkSpaceInfo = async() => {
			if(!currentSpace){
				try{
					await TrackPlayer.reset()
				}catch(ex){
					console.log(ex);
				}
				navigation.navigate("Home");
			}else{
				setSpaceName(currentSpace?.spaceName);
				setOwner(currentSpace?.owner);
				checkQueue(currentSpace?.code);
			}
		}
		checkSpaceInfo();
		socket.emit('get-users-in-room',{
			spaceCode:currentSpace.code
		})
	},[currentSpace])

	useEffect(()=>{
		socket.emit('get-users-in-room',{
			spaceCode:currentSpace.code
		})
		if((currentUser._id === currentSpace?.users[0]?._id) && queue.length > 0){
			emitCurrentSeekPosition()
		}
		if(currentUser && (currentUser._id !== currentSpace?.users[0]?._id) && youtubePlayer){
			socket.emit("get-youtube-position",{spaceCode:currentSpace?.code,userId:currentUser?._id})
		}
	},[])

	const syncYoutubePosition = async() => {
		socket.emit("get-youtube-position",{spaceCode:currentSpace?.code,userId:currentUser?._id})
	}


	useEffect(()=>{
		if(socket){
      socket.on('number-of-users-in-room',({numClients,userIds})=>{
          setNumberOfUsers(numClients);
          setUsersInSpace(userIds);
      })
      socket.on("update-queue",({queue})=>{
      	setQueue(queue);
      })
      socket.on("get-youtube-position",async({userId})=>{
      	console.log("received",youtubePlayer,playing,currentUser._id,currentSpace?.users[0]?._id);
          if(youtubePlayer && playing && (currentUser._id === currentSpace?.users[0]?._id)){
              const seekTo = await playerRef?.current?.getCurrentTime()
      		if(seekTo){
        		console.log("sent",seekTo);
                socket.emit("sending-youtube-position",{
                    userId,
                    seekTo,
                    timestamp:Date.now()
                })	
      		}
          }
      })
		}

		return () => {
			socket.off('number-of-users-in-room');
			socket.off("update-queue");
			socket.off("get-youtube-position");
		}
	},[socket])

   	const removeCurrentSpaceInLocal = async() => {
		await AsyncStorage.removeItem("Rplayer-currentSpace");
	}

	const removeInSpaceCurrentUser = async(code) => {
		const {data} = await axios.post(`${updateInSpace}/${currentUser?._id}`,{
			spaceCode:''
		})
		setCurrentUser(data?.user);
		setTimeout(()=>{
			socket.emit('remove-user-from-space',{
	            spaceCode:code,
	            user:currentUser
	        })

			setCurrentSpace('');
			removeCurrentSpaceInLocal();
			setQueue([]);
			setCurrentSongInfo('');
			setYoutubePlayer(false)
		},500)
	}

	const emitCurrentSeekPosition = async() => {
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

    const handleSliderPress = async (event) => {
	    // Get the width of the slider
	    // Get the X coordinate of the touch
	    const touchX = event.nativeEvent.pageX ;
	    // Calculate the percentage of the touch position
	    const touchPercentage = touchX / sliderWidth;
	    // Calculate the new position in seconds
	    const newPosition = touchPercentage * duration;
	    // Seek to the new position
		socket.emit("play-song",{spaceCode:currentSpace.code,seekTo:newPosition,timestamp:Date.now()});
	    await TrackPlayer.seekTo(newPosition);
	};

	return (
		<LinearGradient 
		colors={['#000060', '#000020', '#410752']}
        style={{
		    flex: 1,
		  }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        className="flex-1 z-10 flex w-full relative" 
        >
	        {/*<Navbar navigation={navigation} />*/}
	    	<Image source={{uri:particleImage3.uri,height:5,width:5}}
			className="absolute top-[200px] right-0 z-0 h-[100px] w-[100px]"/>
			<Image source={{uri:particleImage2.uri,height:5,width:5}}
			className="absolute top-[500px] left-[10%] z-0 h-[100px] w-[100px]"/>
			<Image source={{uri:particleImage2.uri,height:5,width:5}}
			className="absolute bottom-[150px] right-[4%] z-0 h-[100px] w-[100px]"/>
			
			<SongsTab openSongsTab={openSongsTab} setOpenSongsTab={setOpenSongsTab}
			musicImage={musicImage}/>
			<UserListComponent openUsersTab={openUsersTab} setOpenUsersTab={setOpenUsersTab}
			usersInSpace={usersInSpace}
			/>
			<QueueComponent queue={queue} setQueue={setQueue} openQueueTab={openQueueTab} 
			setOpenQueueTab={setOpenQueueTab} musicImage={musicImage}
			/>
			<ChatComponent openChatTab={openChatTab} setOpenChatTab={setOpenChatTab}
			particleImage2={particleImage2} particleImage3={particleImage3}
			currentUser={currentUser} setCurrentUser={setCurrentUser}
			currentSpace={currentSpace}
			/>
			<NewMessageComponent />
			<MoreOptionsComponent currentUser={currentUser} setCurrentUser={setCurrentUser}
			currentSpace={currentSpace} openMoreOptions={openMoreOptions}
			setOpenMoreOptions={setOpenMoreOptions} syncYoutubePosition={syncYoutubePosition}
			/>

			<View
			className={`absolute bottom-0 left-0 border-[1px] border-solid rounded-t-2xl z-50 border-b-[0px] border-gray-200`}>
				<Pressable onPress={()=>{console.log("oressed");setOpenSongsTab(true);}} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1.0 }]} >
					<LinearGradient colors={['#e34aa5','#c94fc9','#ab54f1']}
					useAngle={true} angle={90} className="h-full w-full px-8 py-2 rounded-t-2xl">
						<Icon6 name="music" size={30} color="white" />
					</LinearGradient>
				</Pressable>
			</View>
			<View
			className={`absolute bottom-0 right-0 border-[1px] border-solid rounded-t-2xl z-50 border-b-[0px] border-gray-200`}>
				<Pressable onPress={()=>{setOpenChatTab(true)}} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1.0 }]} >
					<LinearGradient colors={['#e34aa5','#c94fc9','#ab54f1']}
					useAngle={true} angle={90} className="h-full w-full px-7 py-2 rounded-t-2xl">
						<Icon2 name="chatbubble-ellipses-outline" size={30} color="white" />
					</LinearGradient>
				</Pressable>
			</View>

			
			<ScrollView showsVerticalScrollIndicator={false} style={{flex:1}} >
				<StatusBar style="light-content"
				backgroundColor="rgba(0,0,0,0.1)"
				translucent={true}
				/>
				<SafeAreaView className="flex-1 py-2" >
					<View className="flex flex-row px-4 mt-3 items-center">
						<TouchableOpacity onPress={()=>{
							navigation.navigate("Home")
						}}>
							<Icon name="arrowleft" size={25} color="white" />
						</TouchableOpacity>
						<View className="flex px-4">
							<Text className="text-lg font-semibold text-white">
								Space Code : {currentSpace?.code}
							</Text>
							<Text className="text-xs text-gray-400">
								{spaceName} (created by {currentSpace?.owner})
							</Text>
						</View>
						<TouchableOpacity onPress={async()=>{
							removeInSpaceCurrentUser(currentSpace?.code);
							try{
								await TrackPlayer.reset()
							}catch(ex){
								console.log(ex)
							}
							navigation.navigate("Home");
						}} className="ml-auto mr-2" >
							<Icon2 name="exit-outline" size={25} color="red" />
						</TouchableOpacity>
					</View>

					{
						youtubePlayer ?
						<View className="w-full mt-[55px]">
							<YoutubePlayer
				            ref={playerRef}
				            height={240}
				            width={'100%'}
				            play={playing}
				            videoId={currentSongInfo?.videoId}
				            onChangeState={onStateChange}
				            forceAndroidAutoplay

				            initialPlayerParams={{
				              disablekb: 1,
				              modestbranding: true,
				              rel: 0,
				              showinfo: 0,
				            }}
				          />

						</View>
						:
						<View className="image w-full mt-[55px]">
							<Image source={{
								uri:currentSongInfo?.thumbnails?.[3]?.url || currentSongInfo?.cover || musicImage?.uri,
								height:250,
								width:250
							}} className="rounded-2xl mx-auto" />
						</View>

					}

					<View className="w-full flex flex-row mt-12 pl-5 pr-2">
						<View className="flex flex-row w-[70%]">
							<View className="flex">
								<Text numberOfLines={3} className={`text-xl font-semibold ${currentSongInfo?.title ? 'text-white' : 'text-gray-400'}`}>
									{currentSongInfo?.title || '-Queue is empty-'}
								</Text>
								{
									(currentSongInfo?.artist || currentSongInfo?.album )&&
									<Text className="text-md mt-2 text-gray-400">
										{currentSongInfo?.artist || currentSongInfo?.album}
									</Text>
								}
							</View>
						</View>
						<View className="w-[30%] flex flex-row gap-3 justify-end">
							<TouchableOpacity onPress={()=>{
								setOpenUsersTab(true);
							}} className="relative" >
								<View className={`absolute -right-2 ${numberOfUsers > 9 ? 'h-[18px] w-[18px]' : 'h-[14px] w-[14px]'} flex items-center 
								justify-center -top-2 bg-blue-500 z-50 aspect-square rounded-full`}>
									<Text className="text-[10px] text-white" >{numberOfUsers}</Text>
								</View>
								<Icon3 name="users" size={25} color="white"/>
							</TouchableOpacity>
							<TouchableOpacity onPress={()=>{
								setOpenMoreOptions(true);
							}}>
								<Icon4 name="dots-horizontal" size={30} color="white"/>
							</TouchableOpacity>
						</View>
					</View>
					{
						youtubePlayer ?
						<View className="my-3"/>
						:
						<>

							<View className="px-5 pb-3 pt-6">
								<Pressable onLayout={(event) => {
						          const { width } = event.nativeEvent.layout;
						          setSliderWidth(width);
						        }} onPress={handleSliderPress}>
									<View className="h-2 w-full rounded-full bg-gray-800">
										<LinearGradient colors={['#9C3FE4','#C65647']}
										useAngle={true} angle={90} 
										style={{
											width:`${Math.round((position/duration) * 100)}%`
										}}
										className={`h-2 rounded-full relative`}>
											<LinearGradient colors={['#C65647','#C65647']}
											useAngle={true} angle={90}  style={{
									            position: 'absolute',
									            right: -5,
									            top: '50%',
									            transform: [{ translateY: -7 }], // Adjust this value if needed to perfectly center
									            height: 14, // Ball height
									            width: 14, // Ball width
									            borderRadius: 7, // Half of ball height to make it a circle
									            backgroundColor: 'red',
									          }} />
										</LinearGradient>
									</View>
								</Pressable>
							</View>

							<View className="flex items-center flex-row w-full px-5 justify-between">
								<Text className="text-gray-400 text-md text-[15px]" >
									{`${Math.floor(position / 60)}:${String(Math.floor(position % 60)).padStart(2, '0')}`}
								</Text>
								<Text className="text-gray-400 text-md text-[15px]" >
									{`${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`}
								</Text>
							</View>
						</> 
					}
					<View className="px-6 mt-7 flex flex-row items-center justify-between">
						<TouchableOpacity onPress={toggleMute} >
							<Icon3 name={isMuted ? 'volume-mute' : 'volume-up'} size={23} className={`${isMuted && 'mr-5'}`} color="white"/>
						</TouchableOpacity>
						<TouchableOpacity className="opacity-[0.5]" >
							<Icon4 name="skip-previous" size={30} color="white"/>
						</TouchableOpacity>
						<Pressable onPress={async()=>{
							if(youtubePlayer){
								if(playing){
									setPlaying(false);
									setSongPlaying(false);
									if(currentSpace){
						              socket.emit("pause-song",{spaceCode:currentSpace.code});
						            }
								}else{
									setPlaying(true);
									setSongPlaying(true);
									if(currentSpace){
								        const duration = await playerRef?.current?.getCurrentTime();
								        socket.emit("play-song",{spaceCode:currentSpace.code,seekTo:duration,timestamp:Date.now()});
									}
								}
							}else{
								if(playerState.state === State.Playing){
									TrackPlayer.pause();
									if(currentSpace){
						              socket.emit("pause-song",{spaceCode:currentSpace.code});
						            }
								}else{
									if(currentSpace){
								        const duration = await TrackPlayer.getPosition();
								        socket.emit("play-song",{spaceCode:currentSpace.code,seekTo:duration,timestamp:Date.now()});
									}
									TrackPlayer.play()
								}
							}
						}}>
							<View className="rounded-full z-10 relative h-14 w-14 
				            active:scale-[60%] hover:scale-110 active-within:scale-80 focus-within:scale-80 transition-all duration-200 ease-in-out cursor-pointer">
				              <View style={styles.shadow} className="w-full relative h-full flex items-center justify-center 
				              z-10 rounded-full p-2 bg-[#7A51E2]">
								{
									songPlaying ?
									<Icon3 name="pause" size={23} color="white"/>
									:
									<Icon3 name="play" size={23} color="white"/>
								}
				              </View>
				            </View>
			            </Pressable>
						<TouchableOpacity onPress={async()=>{
							if(youtubePlayer){
								const dur = await playerRef?.current?.getDuration();
								playerRef?.current?.seekTo(dur);
								socket.emit("play-song",{spaceCode:currentSpace.code,seekTo:dur,timestamp:Date.now()});
							}else{
								await TrackPlayer.seekTo(duration);
								socket.emit("play-song",{spaceCode:currentSpace.code,seekTo:duration,timestamp:Date.now()});
							}
						}} >
							<Icon4 name="skip-next" size={30} color="white"/>
						</TouchableOpacity>
						<TouchableOpacity onPress={()=>{setOpenQueueTab(true)}} >
							<View className="relative">
								{
									queue?.length > 0 &&
									<View className={`absolute -right-2 ${queue?.length > 9 ? 'h-[18px] w-[18px]' : 'h-[14px] w-[14px]'} flex items-center 
									justify-center -top-2 bg-blue-500 z-50 aspect-square rounded-full`}>
										<Text className="text-[10px] text-white" >{queue?.length}</Text>
									</View>
								}
								<Icon4 name="music-box-multiple" size={25} color="white"/>
							</View>
						</TouchableOpacity>

					</View>
					<View className="px-4 py-4">
						{
							queue?.length > 1 ?
							<Text className="text-md text-gray-400">
								Upcoming : {queue[1]?.info?.videoDetails?.title || queue[1]?.title}
							</Text>
							:
							<View className="my-3" />
						}
					</View>

				</SafeAreaView>

			</ScrollView>
		</LinearGradient>
	)
}

const styles = StyleSheet.create({
    shadow: {  
      borderColor:'white',
      overflow: 'hidden',
      shadowColor: 'blue',
      shadowRadius: 10,
      shadowOpacity: 1,
    }
});
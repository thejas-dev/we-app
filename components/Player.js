
import {View,Pressable,Text,Image} from 'react-native'
import {useState,useEffect} from 'react';
import {songPlayingState,currentSongInfoState,
	hideState,currentSpaceState,tempNavigationState,
	youtubePlayerState} from '../atoms/userAtom';
import {useRecoilState} from 'recoil';
import LinearGradient from 'react-native-linear-gradient';
import TrackPlayer, {Event,State,usePlaybackState,
	useTrackPlayerEvents,useProgress } from 'react-native-track-player';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import {socket} from '../services/socket';

const events = [
  Event.PlaybackState,
  Event.PlaybackError,
];

export default function Player() {
	// console.log(TrackPlayer.getCurrentTrack())
	const [currentSpace,setCurrentSpace] = useRecoilState(currentSpaceState);
	const [songPlaying,setSongPlaying] = useRecoilState(songPlayingState);
	const [tempNavigation,setTempNavigation] = useRecoilState(tempNavigationState);
	const { position, buffered, duration } = useProgress()
  const [currentSongInfo,setCurrentSongInfo] = useRecoilState(currentSongInfoState);
 	const playerState = usePlaybackState();
 	const isPlaying = playerState.state === State.Playing;
  const [youtubePlayer,setYoutubePlayer] = useRecoilState(youtubePlayerState);
 	const [hide,setHide] = useRecoilState(hideState);

	useTrackPlayerEvents(events, (event) => {
	    if (event.type === Event.PlaybackError) {
	      console.warn('An error occured while playing the current track.');
	    }
	    if (event.type === Event.PlaybackState) {
	      setSongPlaying(event.state === State.Playing);
	    }
	});

	const initialisePlayer = async() => {
		try{
			await TrackPlayer.setupPlayer();
			getTrack();
		}catch(ex){
			getTrack();
			console.log(ex);
		}
	}

	const getTrack = async() => {
		try{
			let trackIndex = await TrackPlayer.getCurrentTrack();
			if(trackIndex){
				try{
	        let trackObject = await TrackPlayer.getTrack(trackIndex);
					// console.log(trackObject)
				}catch(ex){
					console.log(ex);
				}
			}
		}catch(ex){
			console.log(ex);
		}
	}

	useEffect(()=>{
		initialisePlayer();
	},[])

	useEffect(()=>{
		if(isPlaying !== songPlaying){
			setSongPlaying(isPlaying);
		}
	},[isPlaying])


	return (
	<Pressable onPress={()=>{
		// setSongPlaying(false);
	}}>
		<View className={`absolute transition-all duration-300 ease-in-out ${currentSongInfo && !hide ? 'bottom-0' : '-bottom-[100px]'} 
		left-0 w-full bg-black/70 z-50`}>
			<View className="w-full h-[3px] mb-1">
				<LinearGradient colors={['#9C3FE4','#C65647']}
				useAngle={true} angle={90} 
				style={{
					width:`${Math.round((position/duration) * 100)}%`
				}}
				className={`h-[3px] rounded-full relative`}>
				<LinearGradient colors={['#C65647','#C65647']}
					useAngle={true} angle={90}  style={{
          position: 'absolute',
          right: -5,
          top: '50%',
          transform: [{ translateY: -4 }], // Adjust this value if needed to perfectly center
          height: 8, // Ball height
          width: 8, // Ball width
          borderRadius: 4, // Half of ball height to make it a circle
          backgroundColor: 'red',
        }} />
				</LinearGradient>
			</View>
			<View className="w-full px-2 py-1 flex flex-row">
				<Pressable onPress={()=>{if(currentSpace && tempNavigation) tempNavigation.navigate("Space")}}>
				<Image source={{
					uri:currentSongInfo?.cover || currentSongInfo?.thumbnails?.[1]?.url || 'https://ik.imagekit.io/d3kzbpbila/thejashari_BKRvogCGD',
					height:50,
					width:50
				}} className="rounded-lg"
				/></Pressable>
				<View className="w-[67%] ml-3">
				<Pressable onPress={()=>{if(currentSpace && tempNavigation) tempNavigation.navigate("Space")}}>
					<View className="flex w-full">
						<Text numberOfLines={1} className="text-md text-gray-200">
							{currentSongInfo?.title}
						</Text>
						{
							youtubePlayer ?
							<Text numberOfLines={1} className="text-sm mt-1 text-gray-400">
								Enter {currentSpace?.spaceName} and Watch The Video
							</Text>
							:
							<Text className="text-sm mt-1 text-gray-400">
								{`${Math.floor(position / 60)}:${String(Math.floor(position % 60)).padStart(2, '0')}/${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`}
							</Text>
						}

					</View>
				</Pressable>
				</View>
				{
					youtubePlayer ? 
					<Pressable onPress={()=>{
						if(currentSpace && tempNavigation) tempNavigation.navigate("Space")
					}} className="flex items-center justify-center" >
					<View className="flex px-3 ml-auto items-center justify-center" >
						<Icon2 name="youtube-play" size={25} color="red"/>
					</View>
					</Pressable>
					:

					<Pressable onPress={async()=>{
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
					}} className="flex items-center justify-center" >
						<View className="flex items-center justify-center px-6 ml-auto">
							{
								songPlaying ?
								<Icon name="pause" size={22} color="white"/>
								:
								<Icon name="play" size={22} color="white"/>
							}
						</View>
					</Pressable>
				}
			</View>


		</View>
	</Pressable>
	)
}
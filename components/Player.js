
import {View,Pressable,Text,Image} from 'react-native'
import {useState,useEffect} from 'react';
import {songPlayingState,currentSongInfoState} from '../atoms/userAtom';
import {useRecoilState} from 'recoil';
import LinearGradient from 'react-native-linear-gradient';
import TrackPlayer, {Event,State,usePlaybackState,
	useTrackPlayerEvents,useProgress } from 'react-native-track-player';
import Icon from 'react-native-vector-icons/FontAwesome5';

const events = [
  Event.PlaybackState,
  Event.PlaybackError,
];

export default function Player() {
	// console.log(TrackPlayer.getCurrentTrack())
	const [songPlaying,setSongPlaying] = useRecoilState(songPlayingState);
	const { position, buffered, duration } = useProgress()
    const [currentSongInfo,setCurrentSongInfo] = useRecoilState(currentSongInfoState);
 	const playerState = usePlaybackState();
 	const isPlaying = playerState.state === State.Playing;

	useTrackPlayerEvents(events, (event) => {
	    if (event.type === Event.PlaybackError) {
	      console.warn('An error occured while playing the current track.');
	    }
	    if (event.type === Event.PlaybackState) {
	      console.log(event.state === State.Playing)
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
			// const track = await TrackPlayer.getCurrentTrack();
			let trackIndex = await TrackPlayer.getCurrentTrack();
        	let trackObject = await TrackPlayer.getTrack(trackIndex);
			console.log(trackObject)
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

	// console.log(duration,position,buffered,`${Math.round((position/duration) * 100)}%`);

	return (
	<Pressable onPress={()=>{
		setSongPlaying(false);
	}}>
		<View className={`absolute transition-all duration-300 ease-in-out ${currentSongInfo ? 'bottom-0' : '-bottom-[100px]'} 
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
				<Image source={{
					uri:currentSongInfo?.thumbnails?.[1]?.url,
					height:50,
					width:50
				}} className="rounded-lg"
				/>
				<View className="w-[67%] ml-3">
					<View className="flex w-full">
						<Text numberOfLines={1} className="text-md text-gray-200">
							{currentSongInfo?.title}
						</Text>
						<Text className="text-sm mt-1 text-gray-400">
							{`${Math.floor(position / 60)}:${String(Math.floor(position % 60)).padStart(2, '0')}/${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`}
						</Text>

					</View>
				</View>
				<Pressable onPress={()=>{
					console.log(playerState.state === State.Playing)
					if(playerState.state === State.Playing){
						TrackPlayer.pause();
					}else{
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
			</View>


		</View>
	</Pressable>
	)
}
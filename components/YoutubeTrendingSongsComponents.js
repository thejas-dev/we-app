
import TrackPlayer, { Capability, State } from 'react-native-track-player';
import {useState,useRef,useEffect} from 'react';
import {currentSongInfoState, currentSpaceState,youtubePlayerState} from '../atoms/userAtom';
import {useRecoilState} from 'recoil';
import {getAudio, getQueueOfSpace} from '../utils/ApiRoutes';
import axios from 'axios';
import { Animated, Easing } from 'react-native';

export default function YoutubeTrendingSongsComponents({
	index,item,View,Image,ActivityIndicator,Pressable,socket
}) {
	
	const bar1Height = useRef(new Animated.Value(50)).current;
  	const bar2Height = useRef(new Animated.Value(25)).current;
  	const bar3Height = useRef(new Animated.Value(50)).current;

	const [loading,setLoading] = useState(false);
    const [currentSongInfo,setCurrentSongInfo] = useRecoilState(currentSongInfoState);
  	const [youtubePlayer,setYoutubePlayer] = useRecoilState(youtubePlayerState);
	const [currentSpace,setCurrentSpace] = useRecoilState(currentSpaceState);

    useEffect(()=>{
        if(currentSongInfo?.videoId === item?.id?.videoId){
            animateBars();
        }
    },[currentSongInfo?.videoId])

	const playSong = async() => {
        console.log("called");
        setLoading(true);
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
        console.log(getAudio)
        const {data} = await axios.post(getAudio,{
            url:'https://www.youtube.com/watch?v='+item?.id?.videoId
        });
        console.log(data)
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
        setLoading(false);	
        if (state === State.Playing) {
            console.log('The player is playing');
        };
    }

    const animateBars = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(bar1Height, {
              toValue: 25,
              duration: 500,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
            Animated.timing(bar2Height, {
              toValue: 50,
              duration: 500,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
            Animated.timing(bar3Height, {
              toValue: 25,
              duration: 500,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
          ]),
          Animated.parallel([
            Animated.timing(bar1Height, {
              toValue: 50,
              duration: 500,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
            Animated.timing(bar2Height, {
              toValue: 25,
              duration: 500,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
            Animated.timing(bar3Height, {
              toValue: 50,
              duration: 500,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
          ]),
        ])
      ).start();
    };

    useEffect(() => {
	    animateBars();
	}, [bar1Height, bar2Height, bar3Height]);

    const addSongToCurrentSpaceQueue = async() => {
    	setLoading(true);
    	const queueData = await axios.post(getQueueOfSpace,{spaceCode:currentSpace.code});
        if(queueData?.data?.queue?.length > 0){
            if(item?.id?.videoId){
                const data2 = await axios.post(getAudio,{
                    url:'https://www.youtube.com/watch?v='+item?.id?.videoId
                });
                
                socket.emit("add-song-to-queue",{
                    spaceCode:currentSpace.code,
                    data:data2.data
                });
            }else{
                socket.emit("add-song-to-queue",{
                    spaceCode:currentSpace.code,
                    data:item
                });
            }
            setLoading(false);  

        }else{
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
            if(item?.id?.videoId){
                const {data} = await axios.post(getAudio,{
                    url:'https://www.youtube.com/watch?v='+item?.id?.videoId
                });
                
                const track1 = {
                    url: data?.url,
                    title: data?.info?.videoDetails?.title,
                    artist: data?.info?.videoDetails?.author?.name,
                    album: data?.info?.videoDetails?.author?.name,
                    duration:data?.info?.videoDetails?.lengthSeconds,
                    date:data?.info?.videoDetails?.publishDate?.split("T")[0],
                    id:data?.info?.videoDetails?.videoId,
                };
                const currentTimestamp = Date.now();
                socket.emit('fetch-song-and-play',{
                    spaceCode: currentSpace.code,
                    data: data,
                    timestamp: currentTimestamp
                });
                setCurrentSongInfo(data?.info?.videoDetails);
                if(data?.youtube){
                    setYoutubePlayer(data?.url);
                }else{
                    setYoutubePlayer('');
                    await TrackPlayer.add(track1);
                    await TrackPlayer.play();
                }

                setLoading(false);	

                socket.emit("create-add-song-to-queue",{
                    spaceCode:currentSpace.code,
                    data
                })
            }else{
                setCurrentSongInfo(item);
                await TrackPlayer.add(item);

                await TrackPlayer.play();
                const state = await TrackPlayer.getState();
                console.log(state)
                const tracks = await TrackPlayer.getQueue();
                console.log(`First title: ${tracks}`);
                setLoading(false);  

                socket.emit("create-add-song-to-queue",{
                    spaceCode:currentSpace.code,
                    data:item
                })

                console.log(state);

            }
        }
    }

	return(
		<Pressable onPress={()=>{
			if(!loading && !currentSpace){
				setLoading(true)
				playSong()
			}else if(currentSpace){
				addSongToCurrentSpaceQueue();
			}
		}}
		>
		<View style={{
			width:250
		}} 
		className={`rounded-lg ml-4 aspect-[16/9] border-[1px] border-solid 
		border-gray-200/60 relative overflow-hidden `}>
			{
				loading &&
				<View className="absolute top-0 left-0 h-full w-full z-30 flex items-center 
				justify-center bg-black/40">
					<ActivityIndicator size={30} color="white" style={{
	        			opacity:1
	        		}} />
				</View>
			}
			{
				(currentSongInfo?.videoId === item?.id?.videoId) &&
				<View className="absolute top-0 left-0 h-full w-full z-30 flex items-center 
				justify-center bg-black/40">
					<View style={{opacity: 0.7}}
					className="w-[50px] h-[50px] flex flex-row items-end justify-around">
						<Animated.View style={{ height: bar2Height }} className="w-[18%] bg-white"/>
						<Animated.View style={{ height: bar1Height }} className="w-[18%] bg-white"/>
						<Animated.View style={{ height: bar2Height }} className="w-[18%] bg-white"/>
						<Animated.View style={{ height: bar3Height }} className="w-[18%] bg-white"/>
					</View>
				</View>

			}
			<Image 
			src={item?.snippet?.thumbnails?.medium?.url}
			style={{
				width:'100%',
				resizeMode:'contain'
			}} className="aspect-[16/9]"
			/>
		</View>
		</Pressable>
	)
}	

import axios from 'axios';
import {getAudio,getQueueOfSpace} from '../utils/ApiRoutes';

export default function SongCard({
	index,item,Image,View,Text,loading,setLoading,
	useState,ActivityIndicator,Pressable,TrackPlayer,Capability,State,
	setCurrentSongInfo,setOpenSongsTab,socket,currentSpace,youtubePlayer,
    setYoutubePlayer,musicImage
}) {
	const [imLoading,setImLoading] = useState(false);

	const playSong = async() => {
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
            setImLoading(false);
            setOpenSongsTab(false);

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
                setImLoading(false);
                setOpenSongsTab(false);

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
                setImLoading(false);
                setOpenSongsTab(false);

                socket.emit("create-add-song-to-queue",{
                    spaceCode:currentSpace.code,
                    data:item
                })

                if (state === State.Playing) {
                    console.log('The player is playing');
                };

            }
        }
    }

	return (
		<Pressable onPress={()=>{
			setImLoading(true);
			setLoading(true);
			playSong();
		}}>
			<View className="relative" >
				{
					imLoading &&
					<View className="absolute top-0 left-0 right-0 bottom-0 m-auto flex bg-black/50
					items-center h-full w-full z-50 justify-center">
						<ActivityIndicator color = 'white'
	               		size = {30}
	               		/>
					</View>
				}
				<View className={`mt-2 p-2 relative rounded-lg flex flex-row ${loading && !imLoading && 'opacity-[0.5]'} bg-gray-800`}>
					<Image source={{uri:item?.snippet?.thumbnails?.medium?.url || item?.cover || musicImage.uri,height:5,width:5}}
					className="aspect-[16/9] h-[50px] w-[30%]"
					/>
					<View className="flex w-[65%] ml-2">
						<Text className="text-md font-semibold text-white" numberOfLines={2} >
							{item?.snippet?.title || item?.title}
						</Text>
						<Text className="text-md font-semibold text-gray-300" numberOfLines={1} >
							{item?.snippet?.channelTitle || item?.album}
						</Text>
					</View>
				</View>
			</View>
		</Pressable>
	)
}
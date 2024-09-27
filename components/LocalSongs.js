import Icon from 'react-native-vector-icons/AntDesign';
import {View,Text,Modal,ScrollView,FlatList,Pressable,Image,
Animated,Easing} from 'react-native';
import {useRef,useEffect,useState} from 'react';
import {host} from '../utils/ApiRoutes'
import RNFS from "react-native-fs";
import LinearGradient from 'react-native-linear-gradient';
import {useRecoilState} from 'recoil';
import {currentUserState} from '../atoms/userAtom'
import {updateFavSong} from '../utils/ApiRoutes';
import axios from 'axios';

export default function LocalSongs({
	TrackPlayer,Capability,State,openLocalSongs,
	setOpenLocalSongs,localSongs,musicImage,
	setCurrentSongInfo,currentSongInfo
}) {
  	const [uploading,setUploading] = useState(false);
  	const [uploadProgress,setUploadProgress] = useState(0);
  	const [currentUser,setCurrentUser] = useRecoilState(currentUserState);
	const bar1Height = useRef(new Animated.Value(20)).current;
  	const bar2Height = useRef(new Animated.Value(10)).current;
  	const bar3Height = useRef(new Animated.Value(20)).current;

	function generateRandom(length) {
	    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	    let result = '';
	    const charactersLength = characters.length;
	    for (let i = 0; i < length; i++) {
	        result += characters.charAt(Math.floor(Math.random() * charactersLength));
	    }
	    return result;
	}

	function formatDuration(duration) {
	  const seconds = Math.floor(duration / 1000);
	  const minutes = Math.floor(seconds / 60);
	  const remainingSeconds = seconds % 60;
	  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
	}

	const playSong = async(item) => {
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
        
        const track1 = {
            url: item?.url,
            title: item?.title,
            artist: item?.artist,
            album: item?.album,
            duration: item?.duration,
            id: item?.url,
            code: item?.url,
            cover: item?.cover
        };
        setCurrentSongInfo(track1);
        await TrackPlayer.add(track1);

        await TrackPlayer.play();
	};

	const uploadSong = async(file) => {
		if(!currentUser) return;
		RNFS.uploadFiles({
            toUrl: `${host}/uploadAudio?id=${generateRandom(10)}&filename=${file.title}`,
            files: [
            	{ name: 'file', filename:file?.title, filepath: file.url, filetype: "audio/mp3" }
            ],
            method: "POST",
            headers: { Accept: "application/json" },
            begin: () => {
            	setUploading(true);
                console.log('File Uploading Started...')
            },
            progress: ({ totalBytesSent, totalBytesExpectedToSend }) => {
            	setUploadProgress((totalBytesSent/totalBytesExpectedToSend)*100);
            	// console.log((totalBytesSent/totalBytesExpectedToSend)*100);
                // console.log({ totalBytesSent, totalBytesExpectedToSend })
            },
        })
        .promise.then(async({ body }) => {
            // Response Here...
            const data = JSON.parse(body); 
            if(data?.error){
            	console.log("ERROR",data?.error)
	            setUploading(false);
            	return;
            }
            const track1 = {
	            url: data?.file,
	            title: file?.title,
	            artist: file?.artist,
	            album: file?.album,
	            duration: file?.duration,
	            id: file?.url,
	            code: file?.url,
	            cover: file?.cover
	        }
	        let tempSongs = currentUser?.favSong?.length > 0 ? [...currentUser?.favSong] : [];
	        tempSongs = [...tempSongs,track1];
	        const data2 = await axios.post(updateFavSong,{favSong:tempSongs,id:currentUser?._id});
	        if(data2?.data?.status){
	        	setCurrentUser(data2?.data?.user);
	        	console.log(data2?.data?.user);
	        }

            setUploading(false);
        })
        .catch(e => {
           console.log('Error',e)
        })
	}


	useEffect(() => {
	    const animateBars = () => {
	      Animated.loop(
	        Animated.sequence([
	          Animated.parallel([
	            Animated.timing(bar1Height, {
	              toValue: 10, // Reduced height
	              duration: 300,
	              easing: Easing.linear,
	              useNativeDriver: false,
	            }),
	            Animated.timing(bar2Height, {
	              toValue: 20, // Reduced height
	              duration: 300,
	              easing: Easing.linear,
	              useNativeDriver: false,
	            }),
	            Animated.timing(bar3Height, {
	              toValue: 10, // Reduced height
	              duration: 300,
	              easing: Easing.linear,
	              useNativeDriver: false,
	            }),
	          ]),
	          Animated.parallel([
	            Animated.timing(bar1Height, {
	              toValue: 20, // Reduced height
	              duration: 300,
	              easing: Easing.linear,
	              useNativeDriver: false,
	            }),
	            Animated.timing(bar2Height, {
	              toValue: 10, // Reduced height
	              duration: 300,
	              easing: Easing.linear,
	              useNativeDriver: false,
	            }),
	            Animated.timing(bar3Height, {
	              toValue: 20, // Reduced height
	              duration: 300,
	              easing: Easing.linear,
	              useNativeDriver: false,
	            }),
	          ]),
	        ])
	      ).start();
	    };

	    animateBars();
	}, [bar1Height, bar2Height, bar3Height,currentSongInfo,openLocalSongs]);

	return (
		<Modal
        animationType="slide"
        transparent={true}
        visible={openLocalSongs}
        className="z-0"
        onRequestClose={() => {
          setOpenLocalSongs(!openLocalSongs);
        }}>
			<View className={`bg-black/80 h-[94%] mt-auto w-full rounded-t-2xl p-5 py-4 flex `}>
				<Pressable onPress={()=> setOpenLocalSongs(!openLocalSongs)}>
					<View className="w-full my-3 flex items-center justify-center">
						<View className="rounded-full bg-gray-200 h-[6px] w-[100px]"/>
					</View>
				</Pressable>
				<View className="flex flex-row justify-between">
					<Text className="text-xl my-2 mt-0 font-bold text-white">
						Your Songs
					</Text>
					{
						uploading &&
						<Text className="text-xl my-2 mt-0 font-bold text-gray-300">
							Uploading
						</Text>
					}

				</View>
				{
					uploading &&
					<View className="my-2 h-[6px] rounded-full overflow-hidden w-full bg-gray-800">
						<LinearGradient colors={['#9C3FE4','#C65647']}
						useAngle={true} angle={90} style={{
							width:`${uploadProgress}%`
						}} 
				        className="h-full"
				        />
					</View>
				}
				{
					localSongs.length < 1 &&
					<View className="mx-auto mt-[40px]" >
						<Text className="text-gray-300 text-xl" >
							Loading...
						</Text>
					</View>
				}

				<View className="w-full rounded-full h-[1px]"/>
					
					<FlatList data={localSongs}
					keyExtracter={item => item?._id}
					renderItem={({item,index})=>(
						<View className="relative">
						{
							uploading &&
							<View className="absolute h-full w-full top-0 bg-black/50 z-50"/>
						}
						<View className={`bg-gray-800/70 relative rounded-xl p-2 mt-2  flex flex-row items-center`} >
							<Pressable onPress={()=>{
								playSong(item);
							}}>
								<View className="relative rounded-xl overflow-hidden">
									{
										currentSongInfo && currentSongInfo?.url === item?.url &&
										<View className="absolute top-0 z-50 left-0 h-full w-full flex items-center 
										justify-center bg-black/60">
											<View style={{opacity: 0.7}}
											className="w-[30] h-[30px] flex flex-row items-end justify-around">
												<Animated.View style={{ height: bar2Height }} className="w-[18%] bg-white"/>
												<Animated.View style={{ height: bar1Height }} className="w-[18%] bg-white"/>
												<Animated.View style={{ height: bar2Height }} className="w-[18%] bg-white"/>
												<Animated.View style={{ height: bar3Height }} className="w-[18%] bg-white"/>
											</View>
										</View>
									}
									<Image source={{uri:item?.cover || musicImage?.uri,height:5,width:5}}
									className="h-[50px] w-[50px] rounded-xl"
									alt=""
									/>
								</View>
							</Pressable>
							<Pressable onPress={()=>{
								playSong(item);
							}} className="flex ml-3 w-[70%]" >
								<View className="flex">
									<Text numberOfLines={1} className="text-md w-full font-semibold text-white">
										{item?.title}
									</Text>
									<Text className="text-gray-200 mt-1 text-md">
										{formatDuration(item?.duration)}
									</Text>
								</View>

							</Pressable>
							<Pressable onPress={()=>{
								uploadSong(item);
							}}>
							<View className="p-1 ml-1">
								<Icon name="upload" size={20} color="white" />
							</View>
							</Pressable>
						</View>
						</View>
					)}/>


			</View>
	    </Modal>
	)
}
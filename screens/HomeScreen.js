import {Text,View,StatusBar,Pressable,Image,FlatList,
	Modal,TouchableOpacity,ActivityIndicator,TextInput,
	StyleSheet,ScrollView,PermissionsAndroid,Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import Icon3 from 'react-native-vector-icons/FontAwesome6';
import Icon4 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon5 from 'react-native-vector-icons/Octicons';
import LinearGradient from 'react-native-linear-gradient';
import Navbar from '../components/Navbar';
import PublicSpaceCardHome from '../components/PublicSpaceCardHome';
import YoutubeTrendingSongsComponents from '../components/YoutubeTrendingSongsComponents';
import {useState,useEffect} from 'react';
import axios from 'axios';
import {useRecoilState} from 'recoil';
import {currentUserState,currentSpaceState,currentSongInfoState,
searchResultState,searchResult2State,tempNavigationState} from '../atoms/userAtom';
import { getAll, getAlbums, searchSongs, SortSongFields, SortSongOrder } from "react-native-get-music-files";
import {getAllPublicSpace,createSpace,updateInSpace,fetchCurrentUserSpaces,
	getSpaceWithCode} from '../utils/ApiRoutes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalSongs from '../components/LocalSongs';
import TrackPlayer, { Capability, State } from 'react-native-track-player';
import {socket} from '../services/socket';
import {particleImage3 as particleImage2, particleImage2 as particleImage3, musicImage} 
	from '../utils/imageEncoded';

const loadingTemp = false;

export default function HomeScreen({
	navigation
}) {
	const [currentUser,setCurrentUser] = useRecoilState(currentUserState);
	const [currentSpace,setCurrentSpace] = useRecoilState(currentSpaceState);
	const [currentSongInfo,setCurrentSongInfo] = useRecoilState(currentSongInfoState);
	const [searchResult,setSearchResult] = useRecoilState(searchResultState);
	const [searchResult2,setSearchResult2] = useRecoilState(searchResult2State);
	const [tempNavigation,setTempNavigation] = useRecoilState(tempNavigationState);
	const [currentUserSpace,setCurrentUserSpace] = useState([]);
	const [joinWithCodeOpen, setJoinWithCodeOpen] = useState(false);
	const [showInfoBox,setShowInfoBox] = useState(false);
	const [newSpaceCreateOpen,setNewSpaceCreateOpen] = useState(false);
	const [spaceName,setSpaceName] = useState('')
	const [creatingPublicSpace,setCreatingPublicSpace] = useState(false);
	const [spaceList,setSpaceList] = useState([]);
	const [localSongs,setLocalSongs] = useState([]);
	const [loading,setLoading] = useState(false)
	const [code,setCode] = useState('');
	const [openLocalSongs,setOpenLocalSongs] = useState(false);

	useEffect(()=>{
		if(navigation){
			setTempNavigation(navigation);
		}
	},[navigation])

	const saveCurrentSpaceInLocal = async(data) => {
		await AsyncStorage.setItem("Rplayer-currentSpace",JSON.stringify(data));
	}

	function generateRandomId(length) {
	  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	  let randomId = '';

	  for (let i = 0; i < length; i++) {
	    const randomIndex = Math.floor(Math.random() * characters.length);
	    randomId += characters.charAt(randomIndex);
	  }

	  return randomId;
	};

	const createSpaceFunc = async() => {
		if(spaceName?.length > 0 && currentUser && !currentSpace){
			setLoading(true);

			const code = await generateRandomId(5);
			let userData = {
				name:currentUser?.name,
				_id:currentUser?._id,
			}
			const users = [userData];
			const {data} = await axios.post(createSpace,{
				ownerImage:currentUser.image,
				ownerId:currentUser?._id,
				isPrivate:!creatingPublicSpace,
				owner:currentUser.name,
				spaceName:spaceName,
				code,
				users
			})
			if(data.status){
				const data2 = await axios.post(`${updateInSpace}/${currentUser?._id}`,{
					spaceCode:data?.space?.code
				})
				if(data2?.data?.status){
					setCurrentUser(data2?.data?.user);
					setCurrentSpace(data?.space);
					saveCurrentSpaceInLocal(data?.space);
					navigation.navigate("Space");
				}
				// setLoading(true);
				// router.push(`/space/${data?.space?.code}`);
			}else{
				setLoading(false);
			}
		}else{
			if(currentSpace)
			Alert.alert("Leave the current space");
		}
	}

	const handleTrendingResponse = async(res) => {
		console.log("Again fecthed")
		if(res?.items){
			let existData = await AsyncStorage.getItem("Rplayer-data")
			await AsyncStorage.setItem("Rplayer-data",JSON.stringify({
				...JSON.parse(existData),
				topTrending:res.items
			}))
			let arr1 = [];
			let arr2  = [];
			for (let i = 0; i < res.items.length; i++){
				if(i < res.items.length/2){
					arr1 = [...arr1,res.items[i]];
				}else{
					arr2 = [...arr2,res.items[i]];
				}
			}
			setSearchResult(arr1);
			setSearchResult2(arr2)
		}else{
			fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=Trending+songs+in+tamil&type=video&key=AIzaSyBViL8Y5USx-gXQMLhQYhiXFtuzTnHSmPw')
			.then(res=>res.json())
			.then(async(res)=>{
				if(res?.items){
					let existData = await AsyncStorage.getItem("Rplayer-data")
					await AsyncStorage.setItem("Rplayer-data",JSON.stringify({
						...JSON.parse(existData),
						topTrending:res.items
					}))
					let arr1 = [];
					let arr2  = [];
					for (let i = 0; i < res.items.length; i++){
						if(i < res.items.length/2){
							arr1 = [...arr1,res.items[i]];
						}else{
							arr2 = [...arr2,res.items[i]];
						}
					}
					setSearchResult(arr1);
					setSearchResult2(arr2);
				}
			}).catch(err=>{
				console.log(err)
			})
		}
	}

	const fetchTrending = async() => {
		const existTrending = await AsyncStorage.getItem("Rplayer-data");
		if(!existTrending){
			fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=Trending+songs+in+tamil&type=video&key=AIzaSyBsSNS3pb_SShB5fFEY3A2ufErYKe-X0VI')
			.then(res=>res.json())
			.then(res=>{
				console.log(res)
				handleTrendingResponse(res);
			}).catch(err=>{
				console.log(err)
			})
		}else{
			const {topTrending} = JSON.parse(existTrending);
			let arr1 = [];
			let arr2  = [];
			for (let i = 0; i < topTrending.length; i++){
				if(i < topTrending.length/2){
					arr1 = [...arr1,topTrending[i]];
				}else{
					arr2 = [...arr2,topTrending[i]];
				}
			}
			setSearchResult(arr1);
			setSearchResult2(arr2)
		}
	}

	const fetchSpaces = async() => {
		const {data} = await axios.get(getAllPublicSpace);
		setSpaceList(data.space);
	}

	const getSongs = async() => {
		try {
		    const granted = await PermissionsAndroid.request(
		      PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
		      {
		        title: 'Audio Files Read Permission',
		        message:
		          'Audio Files Read Permission Required ' +
		          'to Play Songs From Local',
		        buttonNeutral: 'Ask Me Later',
		        buttonNegative: 'Cancel',
		        buttonPositive: 'OK',
		      },
		    );
		    console.log(granted)
		    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
		      console.log('You can view the audio files');
		    } else {
		      console.log('Media Files Permission Denied');
		    }
		} catch (err) {
		    console.warn(err);
		}
		
		const songsOrError = await getAll({
		    limit: 20,
		    offset: 0,
		    coverQuality: 30,
		    minSongDuration: 1000,
		    sortBy: SortSongFields.TITLE,
		    sortOrder: SortSongOrder.DESC,
		});
		if(localSongs.length<1){
			setLocalSongs(songsOrError)
		}
	}

	const playSongFromLocal = async(item) => {
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

	const fetchSpaceWithCodeAndJoin = async() => {
		setLoading(true);
		const {data} = await axios.get(`${getSpaceWithCode}/${code}`);
		if(data?.status){
			setCurrentSpace(data?.space);
			saveCurrentSpaceInLocal(data?.space);
			setJoinWithCodeOpen(false);

			if(currentUser?.inSpace !== data?.space?.code){
				const data2 = await axios.post(`${updateInSpace}/${currentUser?._id}`,{
					spaceCode:data?.space?.code
				})
				if(data2?.data?.status){
					setCurrentUser(data2?.data?.user);
					setLoading(false)
					await TrackPlayer.pause();
					await TrackPlayer.reset();
					setCurrentSongInfo("");
					navigation.navigate("Space");
				}else{
					setLoading(false);
					setShowInfoBox("Something went wrong!");
					setTimeout(()=>{
						setShowInfoBox('');
					},4000)
				}
			}else{
				setLoading(false);
				navigation.navigate("Space");
			}
		}else{
			setLoading(false);
			setShowInfoBox(true);
			setJoinWithCodeOpen(false);
		}

	}

	const fetchCurrentUserSpacesFunc = async() => {
		const {data} = await axios.post(fetchCurrentUserSpaces,{
			id:currentUser?._id
		});
		if(data?.status){
			setCurrentUserSpace(data?.space);
		}
	}

	const checkUserDataInLocal = async() => {
		const data = await AsyncStorage.getItem("Rplayer-user-session");
		if(!data) navigation.navigate("Login");
	}
	
	useEffect(()=>{
		if(currentUser){
			fetchCurrentUserSpacesFunc();
		}else{
			checkUserDataInLocal();
		}
	},[currentUser])

	useEffect(()=>{
		fetchTrending();
		fetchSpaces();
	},[]);


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
        <Navbar navigation={navigation} />
    	<Image source={{uri:particleImage3.uri,height:5,width:5}}
		className="absolute top-[200px] right-0 z-0 h-[100px] w-[100px]"/>
		<Image source={{uri:particleImage2.uri,height:5,width:5}}
		className="absolute top-[500px] left-[10%] z-0 h-[100px] w-[100px]"/>
		<LocalSongs openLocalSongs={openLocalSongs} setOpenLocalSongs={setOpenLocalSongs}
		localSongs={localSongs} musicImage={musicImage} TrackPlayer={TrackPlayer}
		Capability={Capability} State={State} currentSongInfo={currentSongInfo}
		setCurrentSongInfo={setCurrentSongInfo}
		/>
		<ScrollView showsVerticalScrollIndicator={false} style={{flex:1}} >
			<Modal
	        animationType="fade"
	        transparent={true}
	        visible={showInfoBox}
	        onRequestClose={() => {
	          setShowInfoBox(false);
	        }}>
		        <Pressable onPress={() => {
		          setShowInfoBox(false);
		        }} style={styles.centeredView}>
		          <View className="bg-gray-900/80 p-5 py-3 rounded-lg border-[1px] 
		          border-gray-200/50 border-solid" >
		            <Text style={{fontFamily:'Poppins-Medium'}} className="text-white text-lg">
		            	Cant join the space
		            </Text>
		          </View>
		        </Pressable>
	      	</Modal>

			<Modal
	        animationType="slide"
	        transparent={true}
	        visible={joinWithCodeOpen}
	        onRequestClose={() => {
	          setJoinWithCodeOpen(!joinWithCodeOpen);
	        }}>
	        	<View className="bg-black/70 h-full w-full flex items-center justify-center">
	        		<LinearGradient 
					colors={['#000060', '#000020', '#410752']}
			        start={{ x: 0.5, y: 0 }}
			        end={{ x: 0.5, y: 1 }}
			        className="px-4 w-[85%] py-4 pb-3 flex items-center justify-center rounded-lg border-[1px] border-gray-600 relative" 
			        >
			        	<Text className="text-xl font-semibold text-white">
			        		Enter the Code
			        	</Text>
			        	<View className="w-full h-[2px] bg-gray-600/60 my-3"/>
			        	<TextInput value={code} onChangeText={(e)=>setCode(e)} placeholder="Enter Code Here"
						className="text-white w-[90%] border-[1px] border-gray-500 w-full px-3 text-center text-[17px] rounded-lg h-[50px]" />
						<TouchableOpacity onPress={()=>{
							if(code?.length > 0){
								if(!loading) fetchSpaceWithCodeAndJoin();
							}
						}} >
							<View className="px-4 pt-3">
								<Text className="text-white text-lg" >Join</Text>
							</View>
						</TouchableOpacity>

			        </LinearGradient>


	        	</View>

	        </Modal>

	        <Modal
	        animationType="slide"
	        transparent={true}
	        visible={newSpaceCreateOpen}
	        onRequestClose={() => {
	          setNewSpaceCreateOpen(!newSpaceCreateOpen);
	        }}>
	        	<View className="bg-black/70 h-full w-full flex items-center justify-center">
	        		<LinearGradient 
					colors={['#000060', '#000020', '#410752']}
			        start={{ x: 0.5, y: 0 }}
			        end={{ x: 0.5, y: 1 }}
			        className="px-4 w-[85%] py-4 pb-3 flex items-center justify-center rounded-lg border-[1px] 
			        border-gray-500 relative" 
			        >
			        	<Text className="text-xl font-semibold text-white">
			        		Create New Space
			        	</Text>
			        	<View className="w-full h-[2px] bg-gray-600/60 my-3"/>
			        	<TextInput placeholder="Enter space name" value={spaceName} onChangeText={(e)=>setSpaceName(e)}
						className="text-white w-[90%] border-[1px] border-gray-500 w-full px-3 text-[17px] rounded-lg h-[50px]" />
						<TouchableOpacity onPress={()=>{
							setCreatingPublicSpace(!creatingPublicSpace);
						}} className="w-full ml-2" >
							<View className="flex flex-row items-center w-full gap-1 py-5 pb-3">
								{
									creatingPublicSpace ?
									<Icon name="lock-open-outline" size={22} color="white" />
									:
									<Icon name="lock-closed" size={22} color="white" />
								}
								<Text className="text-[18px] font-semibold text-white">
									{
										creatingPublicSpace ?
										'Public':'Private'
									} Space
								</Text>
							</View>
						</TouchableOpacity>
						
						<View className="flex pt-3 items-center justify-between flex-row w-full">
							<TouchableOpacity onPress={()=>{
								setSpaceName('');
								setNewSpaceCreateOpen(false);
							}}
							className="w-[48%]">
								<View className="w-full px-4 rounded-lg py-2 border-[1px] border-gray-600">
									<Text className="text-red-500 text-center text-[15px] font-semibold" >Cancel</Text>
								</View>
							</TouchableOpacity>
							<TouchableOpacity onPress={()=>{
								if(!loading) createSpaceFunc();
							}} className="w-[48%]">
								<LinearGradient colors={['#aa55f4', '#cc4ec4', '#e9489d']}
						        useAngle={true} angle={90} 
						        className="w-full px-4 rounded-lg py-2 border-[1px] border-gray-800">
									<Text className="text-white font-bold text-center text-[15px] font-semibold" >
										Create
									</Text>
								</LinearGradient>
							</TouchableOpacity>
						</View>

			        </LinearGradient>


	        	</View>

	        </Modal>

			<StatusBar style="light-content"
			backgroundColor="rgba(0,0,0,0.1)"
			translucent={true}
			/>
			<SafeAreaView className="flex-1 py-4" >
				<View className="flex flex-row px-4 justify-between">
					<Text style={{fontFamily:"Poppins-SemiBold"}} 
					className="text-xl font-semibold text-white">
						Hi {currentUser?.name}!
					</Text>
					<Pressable onPress={()=>navigation.navigate("Settings")}
					style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1.0 }]}
					>
						<Icon2 name="settings" size={28} color="white"/>
					</Pressable>
				</View>

				<View className="flex flex-row w-[100%] justify-around px-2 py-3">
					<TouchableOpacity onPress={()=>{setNewSpaceCreateOpen(true);TrackPlayer.pause()}} className="w-[48%]" >
						<LinearGradient colors={['#9C3FE4','#C65647']}
						useAngle={true} angle={90} 
				        className="w-[100%] px-5 py-3 rounded-lg mx-auto mt-6"
				        >
					        <Text style={{fontFamily:"Poppins-Medium"}} 
						    className="text-lg font-semibold mx-auto text-white" >
						    	Create Space
						    </Text>
					    </LinearGradient>
					</TouchableOpacity>

					<TouchableOpacity onPress={()=>{setJoinWithCodeOpen(true);TrackPlayer.pause()}} className="w-[48%]" >
						<View 
				        className="w-[100%] px-5 py-[11px] border-[1px] border-gray-500 rounded-lg mx-auto mt-6"
				        >
					        <Text style={{fontFamily:"Poppins-Medium"}} 
						    className="text-lg font-semibold mx-auto text-white" >
						    	Enter Code
						    </Text>
					    </View>
					</TouchableOpacity>
				</View>

				{
					currentSpace &&
					<TouchableOpacity onPress={()=>navigation.navigate("Space")}>
					<View className="w-full py-2 flex flex-row px-4 items-center justify-between">
						<Text className="text-white text-lg" >
							Go to {currentSpace?.spaceName}
						</Text>
						<LinearGradient 
						colors={['#9C3FE4','#C65647']}
						useAngle={true} angle={90} 
				        className="px-2 py-2 rounded-full" 
				        >
				        	<Icon3 name="arrow-right" size={26} color="white"/>

						</LinearGradient>
					</View>
					</TouchableOpacity>
				}

				<View className="mt-5">
					<TouchableOpacity onPress={()=>{
			        	navigation.navigate('PublicSpace')
			        }}>
						<View className="flex mb-3 flex-row w-full px-4 pr-6 justify-between">
							<Text style={{fontFamily:'Poppins-SemiBold'}} 
							className="text-white text-lg">Public Spaces</Text>
					        
					        	<Icon3 name="arrow-right" size={26} color="white"/>
						</View>
					</TouchableOpacity>
					<FlatList data={spaceList}
					keyExtractor={(item, index) => String(index)}
					horizontal={true}
					renderItem={({item,index})=>(
						<PublicSpaceCardHome View={View} Text={Text} Image={Image} item={item} index={index} 
						musicImage={musicImage} Icon3={Icon3} Pressable={Pressable} navigation={navigation} setCurrentSpace={setCurrentSpace}
						LinearGradient={LinearGradient} ActivityIndicator={ActivityIndicator} currentSpace={currentSpace} 
						TrackPlayer={TrackPlayer} setCurrentSongInfo={setCurrentSongInfo}
						/>
					)}/>
					{
						currentUserSpace.length > 0 &&
						<View className="flex mb-3 flex-row w-full px-4 pr-6 mt-5 justify-between">
							<Text style={{fontFamily:'Poppins-SemiBold'}} 
							className="text-white text-lg">My Spaces</Text>
						</View>
					}
					<FlatList data={currentUserSpace}
					keyExtractor={(item, index) => String(index)}
					horizontal={true}
					renderItem={({item,index})=>(
						<PublicSpaceCardHome View={View} Text={Text} Image={Image} item={item} index={index} 
						musicImage={musicImage} Icon3={Icon3} Pressable={Pressable} navigation={navigation} setCurrentSpace={setCurrentSpace}
						LinearGradient={LinearGradient} ActivityIndicator={ActivityIndicator} currentSpace={currentSpace} 
						TrackPlayer={TrackPlayer} setCurrentSongInfo={setCurrentSongInfo} mine="true"
						/>
					)}/>



					<Text style={{fontFamily:'Poppins-SemiBold'}} 
					className="text-white text-lg mt-5 mb-4 px-4">Top Trending Songs</Text>
					<FlatList data={searchResult}
					keyExtractor={(item, index) => String(index)}
					horizontal={true}
					renderItem={({item,index})=>(
						<YoutubeTrendingSongsComponents item={item} index={index} key={index}
						View={View} Image={Image} ActivityIndicator={ActivityIndicator} 
						Pressable={Pressable} socket={socket}
						/>
					)}/>
					<View className="w-full my-3"/>
					<FlatList data={searchResult2}
					keyExtractor={(item, index) => String(index)}
					horizontal={true}
					renderItem={({item,index})=>(
						<YoutubeTrendingSongsComponents item={item} index={index} key={index}
						View={View} Image={Image} ActivityIndicator={ActivityIndicator} 
						Pressable={Pressable} socket={socket}
						/>
					)}/>

					<Text style={{fontFamily:'Poppins-SemiBold'}} 
					className="text-white text-lg mt-5 mb-4 px-4">Your Songs</Text>
					<FlatList
					data={currentUser?.favSong}
					keyExtractor={(item, index) => String(index)}
					horizontal={true}
					ListFooterComponent={()=>(
						<View className="flex ml-4">
							<TouchableOpacity onPress={()=>{
								getSongs();
								setOpenLocalSongs(true);
							}} >
								<View style={{
									width:130,
									borderStyle:"dashed",
									borderRadius: 1,
									borderWidth: 1
								}} className="rounded-lg aspect-square 
								border-gray-200/60 flex mr-4 items-center justify-center overflow-hidden" >
									<Icon5 name="plus-circle" color="white"
									size={36}/>
									<Text className="text-lg mt-2 text-gray-400">
										Upload Song
									</Text>
								</View>
							</TouchableOpacity>
						</View>
					)}
					renderItem={({item,index})=>(
						<Pressable onPress={()=>{
							if(!currentSpace) playSongFromLocal(item);
						}}>
							<View className={`flex ml-4 ${(currentSpace) && 'opacity-[0.5]'} w-[130px]`}>
								<View style={{
									width:130
								}} className="rounded-lg aspect-square  border-[1px] border-solid 
								border-gray-200/60 overflow-hidden">
									<Image source={{uri:item?.cover || musicImage?.uri,height:5,width:5}}
									className="h-full w-full"
									/>
								</View>
								<Text numberOfLines={3} className="text-[14px] text-center mt-2 text-gray-400">
									{item?.title}
								</Text>
							</View>
						</Pressable>
					)}/>

					<View className="my-10"/>

				</View>

			</SafeAreaView>

		</ScrollView>
	</LinearGradient>
	)
}

const styles = StyleSheet.create({
  
  centeredView: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 30,
  },
  
});
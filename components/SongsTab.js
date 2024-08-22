import LinearGradient from 'react-native-linear-gradient';
import {Modal,View,Text,Pressable,TextInput,FlatList,
	ActivityIndicator,Image} from 'react-native';
import Icon3 from 'react-native-vector-icons/FontAwesome5';
import {useState,useEffect,useCallback} from 'react';
import {searchResultState,searchResult2State,currentSpaceState,
	currentUserState,currentSongInfoState,youtubePlayerState} from '../atoms/userAtom';
import {useRecoilState} from 'recoil'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import SongCard from './SongCard';
import TrackPlayer, { Capability, State } from 'react-native-track-player';
import {socket} from '../services/socket';

export default function SongsTab({
	openSongsTab,setOpenSongsTab,musicImage
}) {
	
	const [searchText,setSearchText] = useState('');
	const [searchSongResult,setSearchSongResult] = useState([]);
	const [searchResult,setSearchResult] = useRecoilState(searchResultState);
	const [searchResult2,setSearchResult2] = useRecoilState(searchResultState);
	const [currentSongInfo,setCurrentSongInfo] = useRecoilState(currentSongInfoState);
  const [currentSpace,setCurrentSpace] = useRecoilState(currentSpaceState);
  const [currentUser,setCurrentUser] = useRecoilState(currentUserState);
  const [youtubePlayer,setYoutubePlayer] = useRecoilState(youtubePlayerState);
	const [loading,setLoading] = useState(false);
	const [localSongs,setLocalSongs] = useState(false);

	const fetchSong = async(query) => {
		// console.log(query)
		fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${query}&type=video&key=AIzaSyBViL8Y5USx-gXQMLhQYhiXFtuzTnHSmPw`)
		.then(res=>res.json())
		.then(async(res)=>{
			if(res?.items){
				console.log(res.items);
				await AsyncStorage.setItem("Rplayer-data-Last-Search",JSON.stringify({
					result:res.items
				}))
				setSearchSongResult(res.items);
			}
		}).catch(err=>{
			console.log(err)
		})
	}

  const debounce = (func, delay) => {
    let debounceTimer;
    return function(...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const debouncedFetchSong = useCallback(
    debounce(fetchSong, 500),
    []
  );

  useEffect(() => {
    if (searchText.length > 2) {
      debouncedFetchSong(searchText);
    }
  }, [searchText]);

  useEffect(()=>{
  	if(openSongsTab){
  		const checkAndSetSongsFromLocal = async() => {
				let existData = await AsyncStorage.getItem("Rplayer-data-Last-Search");
				if(existData){
					const {result} = JSON.parse(existData);
					setSearchSongResult(result);
				}
  		}
  		checkAndSetSongsFromLocal();
  	}
  },[openSongsTab])

	return (
		<Modal
        animationType="slide"
        transparent={true}
        visible={openSongsTab}
        className="z-0"
        onRequestClose={() => {
          setOpenSongsTab(!openSongsTab);
        }}>
        <Pressable onPress={()=>setOpenSongsTab(!openSongsTab)}>
        	<View className="w-full h-[30%]"/>
        </Pressable>
			<View className={`bg-black/80 h-[70%] mt-auto w-full rounded-t-2xl p-5 py-4 pb-0 flex `}>
        <Pressable onPress={()=> setOpenSongsTab(!openSongsTab)}>
					<View className="w-full my-3 flex items-center justify-center">
						<View className="rounded-full bg-gray-200 h-[6px] w-[100px]"/>
					</View>
				</Pressable>
				<View className="flex flex-row items-center justify-between">
					<Pressable onPress={()=>{
						setLocalSongs(false);
					}}>
					<Text className={`my-2 mt-0 font-bold ${localSongs ? 'text-gray-300 text-lg' : 'text-red-400 text-xl'}`}>
						Youtube Songs
					</Text>
					</Pressable>
					<Pressable onPress={()=>{
						setLocalSongs(true);
					}}>
					<Text className={`my-2 mt-0 font-bold ${localSongs ? 'text-blue-400 text-xl' : 'text-lg text-gray-300'}`}>
						Local Songs
					</Text>
					</Pressable>
				</View>
				{
					localSongs ?
					<FlatList data={currentUser?.favSong}
					keyExtractor={(item, index) => String(index)}
					ListFooterComponent={()=>(
						<View className="my-3"/>
					)}
					renderItem={({item,index})=>(
						<SongCard musicImage={musicImage} key={index} index={index} item={item} Image={Image}
						View={View} Text={Text} loading={loading} setLoading={setLoading}
						useState={useState}  Pressable={Pressable} ActivityIndicator={ActivityIndicator}
						currentSongInfo={currentSongInfo} setCurrentSongInfo={setCurrentSongInfo}
						TrackPlayer={TrackPlayer} Capability={Capability} State={State}
						setOpenSongsTab={setOpenSongsTab} socket={socket} currentSpace={currentSpace}
						/>
					)}/>
					:
					<>
						<LinearGradient colors={['#292A25','#8C1308']}
						useAngle={true} angle={90} 
						className="rounded-lg mt-2 border-[1px] border-solid 
						border-gray-300/40 mb-2 px-2 py-1 w-full flex flex-row items-center justify-between ">
							<TextInput className=" text-lg p-0 py-1 text-gray-200 w-[80%]"
							placeholder="Search Here" value={searchText} 
							placeholderTextColor="#B9B4B4" 
							onChangeText={(e)=>setSearchText(e)} 
							/>
							<Icon3 name="search" size={20} color="#B9B4B4"/> 
						</LinearGradient>
						{
							searchSongResult.length > 0 ?
							<FlatList data={searchSongResult}
							keyExtractor={(item, index) => String(index)}
							ListFooterComponent={()=>(
								<View className="my-3"/>
							)}
							renderItem={({item,index})=>(
								<SongCard musicImage={musicImage} youtubePlayer={youtubePlayer} setYoutubePlayer={setYoutubePlayer} key={index} index={index} item={item} Image={Image}
								View={View} Text={Text} loading={loading} setLoading={setLoading}
								useState={useState}  Pressable={Pressable} ActivityIndicator={ActivityIndicator}
								currentSongInfo={currentSongInfo} setCurrentSongInfo={setCurrentSongInfo}
								TrackPlayer={TrackPlayer} Capability={Capability} State={State}
								setOpenSongsTab={setOpenSongsTab} socket={socket} currentSpace={currentSpace}
								/>
							)}/>
							:
							<FlatList data={[...searchResult,...searchResult2]}
							keyExtractor={(item, index) => String(index)}
							ListFooterComponent={()=>(
								<View className="my-3"/>
							)}
							renderItem={({item,index})=>(
								<SongCard musicImage={musicImage} youtubePlayer={youtubePlayer} setYoutubePlayer={setYoutubePlayer}  key={index} index={index} item={item} Image={Image}
								View={View} Text={Text} loading={loading} setLoading={setLoading}
								useState={useState} Pressable={Pressable} ActivityIndicator={ActivityIndicator}
								currentSongInfo={currentSongInfo} setCurrentSongInfo={setCurrentSongInfo}
								TrackPlayer={TrackPlayer} Capability={Capability} State={State}
								setOpenSongsTab={setOpenSongsTab} socket={socket} currentSpace={currentSpace}
								/>
							)}/>

						}
					</>
				}


			</View>
        </Modal>
	)
}

import {View,StatusBar,Image,Text,FlatList,
	ActivityIndicator,Pressable,TouchableOpacity,Modal,
	TextInput,StyleSheet} from 'react-native'
import NavbarPublicSpace from '../components/NavbarPublicSpace';
import {SafeAreaView} from 'react-native-safe-area-context'
import {useState,useEffect} from 'react';
import {createSpace,getSpaceWithCode,updateInSpace,
	getAllPublicSpace,getUserById} from '../utils/ApiRoutes';
import {useRecoilState} from 'recoil'
import {currentUserState,currentSpaceState,currentSongInfoState} from '../atoms/userAtom';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PublicScreenPublicSpaceCardHome from '../components/PublicScreenPublicSpaceCardHome';
import {particleImage3 as particleImage2,
	particleImage2 as particleImage3,
	musicImage} from '../utils/imageEncoded';

export default function HomeScreen({navigation}) {
	const [spaceList,setSpaceList] = useState([]);
	const [spaceName,setSpaceName] = useState('');
	const [isPrivate,setIsPrivate] = useState(false);
	const [currentUser,setCurrentUser] = useRecoilState(currentUserState);
	const [currentSpace,setCurrentSpace] = useRecoilState(currentSpaceState)
	const [loading,setLoading] = useState(false);
	const [spaceCode,setSpaceCode] = useState('');
	const [showInfoBox,setShowInfoBox] = useState('');
	const [currentSongInfo,setCurrentSongInfo] = useRecoilState(currentSongInfoState);
	const [code,setCode] = useState('');

	const saveCurrentSpaceInLocal = async(data) => {
		await AsyncStorage.setItem("Rplayer-currentSpace",JSON.stringify(data));
	}

	useEffect(()=>{
		if(!currentUser){
			// navigation.navigate('Login')
		}
		fetchSpaces()
	},[])


	const fetchSpaces = async() => {
		const {data} = await axios.get(getAllPublicSpace);
		console.log(data)
		setSpaceList([...data.space]);
	}

	const goToSpace = async(code) => {
		if(code){
			const spaceCode = code;
			const {data} = await axios.get(`${getSpaceWithCode}/${spaceCode}`);
			if(data.status){
				saveCurrentSpaceInLocal(data?.space);
				setCurrentSpace(data?.space)
				setLoading(false)
			}else{
				setLoading(false);
				setShowInfoBox("Space not found");
				setTimeout(()=>{
					setShowInfoBox('');
				},4000)
			}				
		}
	}

	const getUpdatedCurrentUser = async() => {
		const {data} = await axios.post(getUserById,{id:currentUser?._id})
		if(data.status){
			setCurrentUser(data?.user);
		}
	}

	useEffect(()=>{
		if(currentUser){
			getUpdatedCurrentUser()
		}
	},[])

	return (
	<View className="relative flex-1">
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

		<LinearGradient 
		colors={['#000060', '#000020', '#410752']}
        style={{
		    flex: 1,
		  }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        className="flex-1 z-10 flex w-full px-4 py-4 relative" 
        >
        	<Image source={{uri:particleImage3.uri,height:5,width:5}}
			className="absolute top-[250px] right-0 z-0 h-[100px] w-[100px]"/>
			<Image source={{uri:particleImage3.uri,height:5,width:5}}
			className="absolute top-[550px] left-0 rotate-[180deg] z-0 h-[100px] w-[100px]"/>
			<Image source={{uri:particleImage2.uri,height:5,width:5}}
			className="absolute top-[300px] left-[10%] z-0 h-[100px] w-[100px]"/>
			<Image source={{uri:particleImage2.uri,height:5,width:5}}
			className="absolute top-[500px] right-[10%] z-0 h-[100px] w-[100px]"/>

			<StatusBar style="light-content"
			backgroundColor="rgba(0,0,0,0.1)"
			translucent={true}
			/>

			<SafeAreaView className="flex-1" >
				<View className="flex flex-row items-center">
					<TouchableOpacity onPress={()=>{
						navigation.navigate("Home")
					}} >
						<Icon2 name="arrow-left" size={28} color="white"/>
					</TouchableOpacity>
					<Text className="text-white ml-2 text-2xl font-semibold" >Join Public Space</Text>
				</View>
				<View className="h-[1px] rounded-full w-[100%] mt-5 bg-gray-100/40"/>
				<View className="flex" >
					<FlatList data={spaceList}
					horizontal={false}
					showsVerticalScrollIndicator={false}
					numColumns={2}
					columnWrapperStyle={{justifyContent: 'space-between',gap:10}}
					keyExtracter={item=>item._id}
					ListFooterComponent={()=>(
						<View className={`p-7 ${currentSongInfo ? 'mb-[120px]' : 'mb-14'}`} >

						</View>
					)}
					renderItem={({item})=>(
						<PublicScreenPublicSpaceCardHome item={item}
						musicImage={musicImage}
						saveCurrentSpaceInLocal={saveCurrentSpaceInLocal} 
						navigation={navigation} setShowInfoBox={setShowInfoBox}
						/>
					)}
					/>

				</View>

			</SafeAreaView>
		</LinearGradient>

	</View>
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
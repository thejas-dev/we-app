import {Text,View,StatusBar,Pressable,Image,FlatList,
	Modal,TouchableOpacity,ActivityIndicator,TextInput,
	StyleSheet,ScrollView,PermissionsAndroid} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Navbar from '../components/Navbar';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import {useRecoilState} from 'recoil';
import {currentUserState,currentSpaceState} from '../atoms/userAtom';
import {useState,useEffect,useCallback} from 'react';
import {getSpaceWithCode,updateUserName,
	profileImageUploadUrl} from '../utils/ApiRoutes';
import SettingSpaceCard from '../components/SettingSpaceCard';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileUploadComponent from '../components/ProfileUploadComponent';
import {profileImage,particleImage2,particleImage3,musicImage} from '../utils/imageEncoded'

export default function SettingScreen({
	navigation
}) {
	const [currentUser,setCurrentUser] = useRecoilState(currentUserState);
	const [currentSpace,setCurrentSpace] = useRecoilState(currentSpaceState);
	const [name,setName] = useState('');
	const [email,setEmail] = useState('');
	const [loading,setLoading] = useState(false);
	const [currentSpaceDetails,setCurrentSpaceDetails] = useState('');

	const fetchCurrentUserSpace = async(code) => {
		const {data} = await axios.get(`${getSpaceWithCode}/${code}`);

		if(data?.status){
			const data2 = await AsyncStorage.getItem("Rplayer-currentSpace");
			const parsed = JSON.parse(data2);

			if(parsed?.code === data?.space?.code){

			}else{
				setCurrentSpaceDetails(data?.space)
			}
		}
	}

	const checkLocalCurrentSpace = async() => {
		if(AsyncStorage.getItem("Rplayer-currentSpace")){
			const data = await AsyncStorage.getItem("Rplayer-currentSpace");
			const parsed = JSON.parse(data);
			if(parsed) setCurrentSpaceDetails(parsed);
		}
	}

	useEffect(()=>{
		if(currentUser){
			setName(currentUser?.name);
			setEmail(currentUser?.email);

			if(currentUser?.inSpace){
				fetchCurrentUserSpace(currentUser?.inSpace);
			}
			checkLocalCurrentSpace();
		}
	},[currentUser])

	const logOutFunc = async() => {
		if(!currentSpace){
			await AsyncStorage.removeItem("Rplayer-user-session");
			await AsyncStorage.removeItem("Rplayer-currentSpace");
			AsyncStorage.getItem("Rplayer-user-session");
			navigation.navigate("Login");
		}
	}

	const saveName = async(newName) => {
		const {data} = await axios.post(updateUserName,{
			name:newName,
			id:currentUser?._id
		})
		if(data?.status && data?.user){
			setCurrentUser(data.user);
		}
	}

	const debounce = (func, delay) => {
	    let debounceTimer;
	    return function(...args) {
	      clearTimeout(debounceTimer);
	      debounceTimer = setTimeout(() => func.apply(this, args), delay);
	    };
  	};

  	const uploadProfilePicture = async(image) => {
  		console.log(image);
  		setLoading(true);
  		const formData = new FormData();
	  	formData.append('profilePicture', {
		    uri: image.uri,
		    name: image.name,
		    type: image.type,
	  	});

	  	try{
	  		const {data} = await axios.post(`${profileImageUploadUrl}?id=${currentUser?._id}`,formData,{
	  			headers: {
			    	'Content-Type': 'multipart/form-data',
			    },
	  		})
	  		if(data?.status){
	  			setCurrentUser(data?.user);
  		    	console.log('Image uploaded successfully: ', data.user);
	  		}
	  		setLoading(false);
	  	}catch(error){
	  		setLoading(false);
	  		console.error('Error uploading image: ', error);
	  	}
  	}

  	const debouncedFetchSong = useCallback(
	    debounce(saveName, 500),
	    []
  	);

  	useEffect(() => {
	    if (name?.length > 2) {
	      debouncedFetchSong(name);
	    }
  	}, [name]);

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
    	<Image source={{uri:particleImage2.uri,height:5,width:5}}
		className="absolute top-[200px] right-0 z-0 h-[100px] w-[100px]"/>
		<Image source={{uri:particleImage3.uri,height:5,width:5}}
		className="absolute top-[500px] left-[10%] z-0 h-[100px] w-[100px]"/>
			<SafeAreaView className="flex-1 " >
				<ScrollView showsVerticalScrollIndicator={false} style={{flex:1}} >
					<View className="w-full px-4 mt-4">
						<View className="flex flex-row gap-4 items-center">
							<TouchableOpacity onPress={()=>{
								navigation.navigate("Home")
							}}>
								<Icon name="arrow-left" size={22} color="white"/>
							</TouchableOpacity>
							<Text style={{fontFamily:"Poppins-SemiBold"}} 
							className="text-2xl font-semibold text-white">
								Settings
							</Text>
						</View>
					</View>

					<View className="px-4 w-full py-7 mt-2">
						<View className="flex gap-2">
							<Text className="text-2xl text-center font-semibold text-white" >
								Your Profile Photo
							</Text>
							<View className="w-full p-4 flex items-center justify-center">
								<View className="relative" >
									<ProfileUploadComponent uploadProfilePicture={uploadProfilePicture}
									Icon2={Icon2}
									/>
									{
										loading &&
										<View className="absolute top-0 left-0 h-[160px] w-[160px] 
										rounded-full z-50 bg-black/20 flex items-center justify-center">
											<ActivityIndicator size={'xl'} color="white" />
										</View>
									}
									
									<Image source={{
										uri:currentUser?.image || profileImage.uri,height:5,width:5
									}} className="h-[160px] rounded-full w-[160px]"
									/>
								</View>
								<Text className="text-md text-center font-semibold text-gray-400 mt-4" >
									<Text className="text-red-500" >*</Text> Will appear in rooms you create
								</Text>
							</View>

							<Text className="text-xl text-white font-semibold px-2" >Your Name</Text>
							<View className="px-2 pt-1">
								<View className="p-1 rounded-lg bg-gray-900 border-solid border-gray-300 border-[1px]">
									{
										currentSpace ?
										<Text className="p-0 px-2 text-gray-200 py-2 text-lg">
											{name}
										</Text>
										:
										<TextInput className="p-0 px-2 py-2 text-white text-lg" value={name} onChangeText={(e)=>{
											if(!currentSpace){
												setName(e);
											}
										}} 
										/>
									}
								</View>
							</View>

							<Text className="text-xl text-white font-semibold px-2 pt-2" >Your Email</Text>
							<View className="px-2 pt-1">
								<View className="p-1 relative rounded-lg bg-gray-900 border-solid border-gray-200/50 border-[1px]">
									<Text style={{
										opacity:0.5
									}} className="p-0 px-2 py-2 text-white text-lg" 
									>{email}
									</Text>
								</View>
							</View>

							{
								currentUser?.inSpace &&
								<View className="px-2" >
									<Text className="text-xl text-white font-semibold pt-2" >Living Space</Text>
									<SettingSpaceCard musicImage={musicImage}
									mine="true" item={currentSpaceDetails}
									/>
								</View>
							}
							<View className="px-2">
								<TouchableOpacity onPress={logOutFunc}>
									<View className={`bg-gray-900/50 border-[1px] border-solid border-gray-200/50 mt-5 flex items-center flex-row 
									justify-between w-full rounded-lg px-5 ${currentSpace && 'opacity-40'} py-3`}>
										<Text className="text-gray-100 font-semibold text-xl font-semibold" >
											Log Out
										</Text>
										<Icon2 name="logout" size={25} color="white"/>
									</View>
								</TouchableOpacity>
							</View>

						</View>


					</View>


				</ScrollView>
			</SafeAreaView>
		</LinearGradient>
	)
} 
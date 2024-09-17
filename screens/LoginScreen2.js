import {View,Text,SafeAreaView,StatusBar,StyleSheet,
	TextInput,Image,Modal,ActivityIndicator,ImageBackground,Pressable} from 'react-native'
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/Fontisto';
import Icon3 from 'react-native-vector-icons/FontAwesome';
import {useState,useEffect} from 'react';
import {registerRoute,login} from '../utils/ApiRoutes';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRecoilState} from 'recoil'
import {currentUserState} from '../atoms/userAtom';
import {particleImage3,image,illustration,googleImage,illustration2,
	particleImage,particleImage2} from '../utils/imageEncoded';

export default function LoginScreen2({
	navigation
}) {
	const [show,setShow] = useState(false);
	const [register,setRegister] = useState(false);
	const [showConfirm,setShowConfirm] = useState(false);
	const [email,setEmail] = useState('');
	const [name,setName] = useState('');
	const [password,setPassword] = useState('');
	const [confirmPassword,setConfirmPassword] = useState('');
	const [emailInvalid,setEmailInvalid] = useState('');
	const [showInfoBox,setShowInfoBox] = useState('');
	const [currentUser,setCurrentUser] = useRecoilState(currentUserState);
	const [loading,setLoading] = useState(false);
	const [showFeatureNotAvailable,setShowFeatureNotAvailable] = useState(false);

	const fetchData = async() => {
		console.log("ran")
		const data = await AsyncStorage.getItem("Rplayer-user-session");
		const passData = await AsyncStorage.getItem("Rplayer-user-password");
		const parsed = JSON.parse(data);
		const passParsed = JSON.parse(passData);

		if(parsed && passParsed){
			loginWithSessionData(parsed.email,passParsed.password);
		}
		console.log(parsed)
	}

	const loginWithSessionData = async(email,password) => {
		if (/@gmail\.com$/.test(email)){
			setLoading(true);
			const {data} = await axios.post(login,{
				email,password
			})
			if(data.status){
				const userDataForSession = {
					email,
					password
				}
				await AsyncStorage.setItem("Rplayer-user-session",JSON.stringify(data?.user))
				await AsyncStorage.setItem("Rplayer-user-password",JSON.stringify({password:password}));
				setCurrentUser(data?.user);
				navigation.navigate("Home");
				setLoading(false);
			}else{
				setLoading(false);
				// console.log(data)
				setShowInfoBox(true);
				setTimeout(()=>{setShowInfoBox(false)},4000)
			}
		}else{
			setLoading(false)
			setEmailInvalid(true);
			setTimeout(()=>{
				setEmailInvalid(false);					
			},4000)
		}
	}

	useEffect(()=>{
		fetchData()
	},[])

	const loginNow = async() => {
		if(register){
			if (/@gmail\.com$/.test(email)){
				setLoading(true)
				const {data} = await axios.post(registerRoute,{
					name:name,
					username:name,
					password,
					email,
					image:''
				})
				if(data?.status){
					const userDataForSession = {
						email,
						password
					}
					await AsyncStorage.setItem("Rplayer-user-session",JSON.stringify(data?.user));
					await AsyncStorage.setItem("Rplayer-user-password",JSON.stringify({password:password}));
					setCurrentUser(data?.user);
					setLoading(false);
					navigation.navigate("Home")
				}else{
					setLoading(false)
					setShowInfoBox(true)
					setTimeout(()=>{setShowInfoBox(false)},4000)
				}
			}else{
				setLoading(false)
				setEmailInvalid(true);
				setTimeout(()=>{
					setEmailInvalid(false);					
				},4000)
			}	

		}else{
			if (/@gmail\.com$/.test(email)){
				setLoading(true);
				const {data} = await axios.post(login,{
					email,password
				})
				if(data.status){
					const userDataForSession = {
						email,
						password
					}
					await AsyncStorage.setItem("Rplayer-user-session",JSON.stringify(data?.user));
					await AsyncStorage.setItem("Rplayer-user-password",JSON.stringify({password:password}));
					setCurrentUser(data?.user);
					navigation.navigate("Home");
					setLoading(false);
				}else{
					setLoading(false);
					// console.log(data)
					setShowInfoBox(true);
					setTimeout(()=>{setShowInfoBox(false)},4000)
				}
			}else{
				setLoading(false)
				setEmailInvalid(true);
				setTimeout(()=>{
					setEmailInvalid(false);					
				},4000)
			}
		}
	}

	const featureNotAvailable = () => {
		setShowFeatureNotAvailable(true);
		setTimeout(()=>{
			setShowFeatureNotAvailable(false);
		},2000)
	}

	return (
		<View className="h-full w-full relative bg-gray-900 justify-end" >
			<View className={`absolute z-50 flex ${showFeatureNotAvailable ? 'bottom-5' : '-bottom-[100%]'} items-center justify-center w-full`}>
				<View className="px-4 bg-black/60 py-2 rounded-lg">
					<Text className="text-[15px]" >
						Feature Currently Not Available
					</Text>
				</View>
			</View>	
			<StatusBar backgroundColor="rgba(0,0,0,0.2)" translucent={true}
			animated={true} barStyle='light-content' />
			<Modal
      animationType="fade"
      transparent={true}
      visible={emailInvalid}
      onRequestClose={() => {
        setEmailInvalid(false);
      }}>
        <Pressable onPress={() => {
          setEmailInvalid(false);
        }} style={styles.centeredView}>
          <View className="bg-gray-900/50 p-5 py-3 rounded-lg border-[1px] 
          border-gray-200/50 border-solid" >
            <Text className="text-white font-semibold text-lg">Invalid Email!</Text>
          </View>
        </Pressable>
    	</Modal>
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
          <View className="bg-gray-900/50 p-5 py-3 rounded-lg border-[1px] 
          border-gray-200/50 border-solid" >
            <Text style={{fontFamily:'Poppins-Medium'}} className="text-white text-lg">
            {
            	register ?
            	'Something went wrong!'
            	:
            	'Email ID/Password incorrect'
            }
            </Text>
          </View>
        </Pressable>
    	</Modal>
			{
				register &&
				<>
					<Image source={{uri:particleImage.uri,height:5,width:5}}
					className="absolute top-12 left-[100px] h-[100px] w-[100px]"/>
					<Image source={{uri:particleImage.uri,height:5,width:5}}
					className="absolute top-[150px] left-14 h-[100px] w-[100px]"/>
				</>
			}
			<Image source={{uri:particleImage2.uri,height:5,width:5}}
			className="absolute top-[280px] right-0 z-30 h-[100px] w-[100px]"/>
			<Image source={{uri:particleImage3.uri,height:5,width:5}}
			className="absolute top-[250px] left-0 z-30 h-[100px] w-[100px]"/>
			<View className="top-0 left-0 absolute w-full" >
				{
					register ?
					<Image source={{uri:illustration2.uri,height:5,width:5}}
					className="h-[280px] w-[60%] ml-auto"
					resizeMode="cover"
					/>
					:
					<Image source={{uri:illustration.uri,height:5,width:5}}
					className="h-[400px] w-full"
					resizeMode="cover"

					/>
				}

			</View>

			<ImageBackground source={image}
			resizeMode='stretch'
			className="w-full flex-1 mt-[100px] relative justify-end"
			imageStyle={{
				opacity:0.9
			}}
			>
				<View className="h-[85%] w-full" >
					<View className={`h-[5px] mx-auto rounded-full bg-gray-400 mt-12 w-[70px]`} />
					<Text style={{
						fontFamily:"Poppins-SemiBold",
						fontSize:30
					}} className="text-bold	mt-4 mx-auto text-[#EFEFEF]" >{register ? 'Get Started Now':'Welcome Back!'}</Text>
					{
						!register &&
						<Text style={{
							fontFamily:"Poppins-Medium",
							fontSize:15
						}} className="mt-0 mx-auto text-[#A4A4A4]"  >
							Happy to see you again
						</Text>
					}
					<View className={`flex w-[80%] ${register ? 'mt-2' : 'mt-4' } mx-auto`} >
						{
							register &&
							<>
								<Text className="mt-0 text-[#A4A4A4] text-[15.4px]" >
									Username
								</Text>
								<View
						        className="flex flex-row w-full items-center bg-gray-200/10 mt-3 
						        rounded-md px-3 border-[0.2px] border-solid border-gray-200 z-50"
								>	
								
									<Icon3 name="user-o"
									size={25} color="#A4A4A4"/>
									<TextInput value={name} onChangeText={(e)=>setName(e)}
									className="text-white w-[90%] ml-2 text-[17px] h-[50px]" />


								</View>
							</>
						}
						<Text className="mt-3 text-[#A4A4A4] text-[15.4px]" >
							Email
						</Text>
						<View
				        className="flex flex-row w-full items-center bg-gray-200/10 mt-3 
				        rounded-md px-3 border-[0.2px] border-solid border-gray-200 z-50"
						>	
						
							<Icon name="email-outline"
							size={25} color="#A4A4A4"/>
							<TextInput value={email} onChangeText={(e)=>setEmail(e)} 
							className="text-white w-[90%] ml-2 text-[17px] h-[50px]" />


						</View>
						<Text className="mt-4 text-[#A4A4A4] text-[15px]" >
							Password
						</Text>
						<View
				        className="flex flex-row w-full items-center bg-gray-200/10 mt-3 
				        rounded-md px-3 border-[0.2px] border-solid border-gray-200 z-50"
						>	
						
							<Icon name="lock-outline"
							size={25} color="#A4A4A4"/>
							<TextInput value={password} onChangeText={(e)=>setPassword(e)} 
							secureTextEntry={true} className="text-white w-[90%] ml-2 text-[17px] h-[50px]" />


						</View>
						<View  className="mt-5 flex flex-row justify-between" >
							{
								!register && 
								<Pressable  style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1.0 }]} 
								>
								<Text style={{fontFamily:'Poppins-Medium',fontSize:15}} className="ml-auto text-[#A4A4A4] text-md " >
									Forget Password?
								</Text>
								</Pressable>
							}
							<Pressable onPress={()=>setRegister(!register)} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1.0 }]} 
							>
							{
								register ?
								<Text style={{fontFamily:'Poppins-Medium',fontSize:15}} className="ml-auto text-blue-400 font-bold  " >
									<Text style={{fontFamily:'Poppins-Medium'}}
									className="text-[#A4A4A4] font-semibold" >Already Having an account?</Text> Login Now
								</Text>
								:
								<Text style={{fontFamily:'Poppins-Medium',fontSize:15}} className="ml-auto text-blue-400 font-bold  " >
									Create New Account
								</Text>
							}
							</Pressable>

						</View>

						<Pressable style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1.0 }]} 
						onPress={()=>{loginNow()}} >
							<LinearGradient colors={['#9C3FE4','#C65647']}
							useAngle={true} angle={90} 
					        className="w-[100%] px-5 py-3 rounded-lg mx-auto mt-6"
					        >	
					        	{
					        		loading ?
					        		<ActivityIndicator size={29} color="white" style={{
					        			opacity:0.7
					        		}} />
					        		:
						        	<Text style={{fontFamily:"Poppins-Medium"}} 
						        	className="text-lg font-semibold mx-auto text-white" >{register ? 'Sign Up' : 'Sign In'}</Text>
					        	}
					        </LinearGradient>
				        </Pressable>
				        <View className="flex flex-row mt-3 justify-around items-center">
				        	<LinearGradient colors={['rgba(255,255,255,0)','#D9D9D9']}
							useAngle={true} angle={90} 
							className="w-[35%] p-[0.9px]"/>
								<Text className="text-gray-400" >Or</Text>
							<LinearGradient colors={['#D9D9D9','rgba(255,255,255,0)']}
							useAngle={true} angle={90} 
							className="w-[35%] p-[0.9px]"/>

				        </View>

				        <Pressable onPress={()=>featureNotAvailable()} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1.0 }]} >
					        <LinearGradient colors={['rgba(229,231,235,0.2)','rgba(229,231,235,0.05)']}
					        useAngle={true} angle={90}
					        className="w-full flex flex-row px-4 py-2 border-[1px] border-solid 
					        border-gray-200/30 mt-3 items-center rounded-2xl ">
					        	<Image source={{uri:googleImage.uri,height:5,width:5}}
					        	className="h-7 w-7"
					        	/>
					        	<Text className="text-[17px] ml-5 text-[#A4A4A4]" >Login With Google</Text>
					        </LinearGradient>
				        </Pressable>

					</View>


				</View>
			</ImageBackground>


		</View>
	)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    borderRadius: 20, // This matches the rounded corners in your image
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
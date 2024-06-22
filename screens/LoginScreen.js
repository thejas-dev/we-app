import {StatusBar,SafeAreaView,View,Text,
	TextInput,ImageBackground} from 'react-native'
import {AiOutlineEyeInvisible,AiOutlineEye} from 'react-icons/ai';
import {useState} from 'react';
import {registerRoute,login} from '../utils/ApiRoutes';
import axios from 'axios';
import {useRecoilState} from 'recoil'
import {currentUserState} from '../atoms/userAtom';

const image = {uri: 'https://ik.imagekit.io/d3kzbpbila/thejashari_dtRcoUnmB'};

export default function LoginScreen({navigation}) {

	const [show,setShow] = useState(false);
	const [register,setRegister] = useState(false);
	const [showConfirm,setShowConfirm] = useState(false);
	const [email,setEmail] = useState('');
	const [password,setPassword] = useState('');
	const [confirmPassword,setConfirmPassword] = useState('');
	const [emailInvalid,setEmailInvalid] = useState('');
	const [showInfoBox,setShowInfoBox] = useState('');
	const [currentUser,setCurrentUser] = useRecoilState(currentUserState);
	const [loading,setLoading] = useState(false);

	const loginNow = async(e) => {
		// if(e) e.preventDefault();
		if(register){
			if (/@gmail\.com$/.test(email)){
				if(confirmPassword === password){
					setLoading(true)
					const {data} = await axios.post(registerRoute,{
						name:email.split('@')[0],
						username:email.split('@')[0],
						password,
						email,
						image:''
					})
					if(data?.status){
						const userDataForSession = {
							email:data?.user?.email,
							password
						}
						sessionStorage.setItem("Rplayer-user-session",JSON.stringify(userDataForSession))
						setCurrentUser(data?.user);
						navigation.navigate("Home")
					}else{
						setLoading(false)
						setShowInfoBox("Something went wrong!")
						setTimeout(()=>{setShowInfoBox('')},4000)
					}
				}else{
					setLoading(false)
					setShowInfoBox("Password not matching!");
					setTimeout(()=>{setShowInfoBox('')},4000)
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
						email:data?.user?.email,
						password
					}
					sessionStorage.setItem("Rplayer-user-session",JSON.stringify(userDataForSession))
					setCurrentUser(data?.user);
					navigation.navigate("Home")
				}else{
					setLoading(false)
					setShowInfoBox("Incorrect email id or password");
					setTimeout(()=>{setShowInfoBox('')},4000)
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

	return (
		<SafeAreaView>
			<ImageBackground source={image} resizeMode="cover" 
			className="w-full h-full justify-center relative flex">
				<View 
				onClick={()=>setShowInfoBox('')}
				className={`bg-[rgba(255,255,255,0.05)] px-4 py-3 max-w-lg text-center z-50
				absolute  left-0 right-0 mx-auto ${showInfoBox ? 'top-0' : '-top-[300px]'} transition-all duration-300
				ease-in-out text-lg font-mono text-gray-200 border-[1px] border-gray-200/30`}>
					{showInfoBox}
				</View>
				<View className="flex-1 items-center justify-center w-full bg-black/60">
					<View className="w-[90%] p-7 
					backdrop-blur-md rounded-lg bg-[rgba(255,255,255,0.03)] flex  flex-col">
						<Text className="text-3xl font-serif text-white">{
							register ? 'Sign up' : 'Sign in'
						}</Text>
						<Text className="text-md mt-1 text-gray-200">{
							register ?
							'Groove to the Rhythm of Your Tunes'
							:
							'Keep it all together and you will be fine'
						}</Text>

						<View 
						onSubmit={(e)=>loginNow(e)}
						className="w-full flex items-center mt-5 flex-col gap-5 p-1">
							<View className={`rounded-sm border-[1px] flex items-center w-full py-2 px-2
							${emailInvalid ? 'border-red-500 animate-pulse' : 'focus-within:border-sky-300 border-gray-200/40 '} `}>
								<TextInput type="email" placeholder="Enter your email" alt="" className="w-full placeholder:text-gray-400 bg-transparent text-gray-200 
								font-mono outline-none"
								value={email} onChangeText={(e)=>setEmail(e.target.value)}
								/>
							</View>
							<View className="rounded-sm border-[1px] border-gray-200/40 flex items-center w-full py-2 px-2
							focus-within:border-sky-300 ">
								<TextInput type={show ? 'text' : 'password'} placeholder="Password" alt="" className="w-full placeholder:text-gray-400 bg-transparent text-gray-200 
								font-mono outline-none"
								value={password} onChangeText={(e)=>setPassword(e.target.value)}							
								/>
								{
									/*show ?
									<AiOutlineEye onClick={()=>{
										setShow(false);
									}} className="text-gray-400 h-6 w-6"/>
									:
									<AiOutlineEyeInvisible onClick={()=>{
										setShow(true);
									}} className="text-gray-600 h-6 w-6"/>
*/
								}
							</View>
							{
								register &&
								<View className="rounded-sm border-[1px] border-gray-200/40 flex items-center w-full py-2 px-2
								focus-within:border-sky-300 ">
									<TextInput type={showConfirm ? 'text' : 'password'} placeholder="Confirm password" alt="" className="w-full placeholder:text-gray-400 bg-transparent text-gray-200 
									font-mono outline-none"
									value={confirmPassword} onChangeText={(e)=>setConfirmPassword(e.target.value)}
									/>
									{
										/*showConfirm ?
										<AiOutlineEye onClick={()=>{
											setShowConfirm(false);
										}} className="text-gray-400 h-6 w-6"/>
										:
										<AiOutlineEyeInvisible onClick={()=>{
											setShowConfirm(true);
										}} className="text-gray-600 h-6 w-6"/>
*/
									}
								</View>
							}

							<View type="submit" className="w-full bg-purple-700 font-mono text-white 
							rounded-md py-3 flex items-center justify-center">{
								loading ? 
								<View className="loader mx-auto my-1">
							        <View className="dots" id="dot-1"></View>
							        <View className="dots" id="dot-2"></View>
							        <View className="dots" id="dot-3"></View>
							    </View>
								:
								register ?
								<Text className="font-mono text-white" >Sign up</Text>
								:
								<Text className="font-mono text-white" >Sign in</Text>
							}</View>

						</View>
						<Text className="mt-5 text-white font-mono">{
							register ? 
							'Already a user '
							:
							'New to Rplayer '
						}<Text 
						onClick={()=>{
							setRegister(!register)
						}}
						className="text-purple-400 
						cursor-pointer hover:text-purple-300">{
							register ? 
							'Login'
							:
							'Join now'
						}</Text></Text>
					</View>
				</View>


			</ImageBackground>



		</SafeAreaView>
	)
}
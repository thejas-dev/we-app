
import {View,Text,Image,ActivityIndicator,Pressable} from 'react-native';
import {useState,useEffect} from 'react';
import TrackPlayer from 'react-native-track-player';
import Icon3 from 'react-native-vector-icons/FontAwesome6';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useRecoilState} from 'recoil';
import {currentUserState,currentSpaceState,currentSongInfoState} from '../atoms/userAtom'
import {getSpaceWithCode,updateInSpace} from '../utils/ApiRoutes'
import axios from 'axios';

export default function PublicScreenPublicSpaceCardHome({
	item,musicImage,setShowInfoBox,
	saveCurrentSpaceInLocal,navigation
}) {

	const [currentUser,setCurrentUser] = useRecoilState(currentUserState);
	const [currentSpace,setCurrentSpace] = useRecoilState(currentSpaceState);
	const [currentSongInfo,setCurrentSongInfo] = useRecoilState(currentSongInfoState);
	const [loading,setLoading] = useState(false);
	
	const goToSpace = async() => {
		if(item && currentUser){
			setLoading(true);
			const spaceCode = item?.code;
			const {data} = await axios.get(`${getSpaceWithCode}/${spaceCode}`);

			if(data.status){
				setCurrentSpace(data?.space);
				saveCurrentSpaceInLocal(data?.space);

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
				setShowInfoBox("Space not found");
				setTimeout(()=>{
					setShowInfoBox('');
				},4000)
			}				
		}
	}

	return (
		<View className="w-[48%] mt-5 bg-gray-800/40 px-3 py-3 rounded-lg 
		border-[1px] border-solid border-gray-200/50 flex  items-center" >
			<View style={{
				elevation: 40,
				shadowColor: 'red',
			}} >
				<Image source={{
					uri:item?.ownerImage || musicImage.uri,
					width:5
				}} style={{
					borderWidth:0.5,
					borderColor:'gray',

				}} 
				className="aspect-square w-full rounded-lg border-[1px] border-solid border-white"/>
			</View>
			<View className="flex mt-4 w-full px-1">
				<Text numberOfLines={1} className="text-lg text-purple-400 font-semibold" >
					{item?.spaceName}
				</Text>
				<View className="flex mt-2 flex-row items-center" >
					<Icon2 name="key-variant"
					size={15} color="#A4A4A4"/>
					<Text className="text-md text-gray-400 ml-2 font-semibold" >
						{item?.code}
					</Text>
				</View>
				<View className="flex mt-2 flex-row items-center" >
					<Icon3 name="user"
					size={15} color="#A4A4A4"/>
					<Text className="text-md text-gray-400 ml-2 font-semibold" >
						{item?.owner}
					</Text>
				</View>
				<Pressable style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1.0 }]} 
				onPress={async()=>{
					if(currentSpace?.code === item?.code){
						navigation.navigate("Space");
					}else{
						goToSpace();
					}
				}} >
					<LinearGradient colors={['#9C3FE4','#C65647']}
					useAngle={true} angle={90} 
			        className="w-[100%] px-3 py-1 rounded-md mt-4 mx-auto"
			        >	
			        	{
			        		loading ?
			        		<ActivityIndicator size={19} color="white" style={{
			        			opacity:0.7
			        		}} />
			        		:
				        	<Text style={{fontFamily:"Poppins-Medium"}} 
				        	className="text-md font-semibold mx-auto text-white" >
				        		{currentSpace?.code === item?.code ? 'Open' : 'Join'}
				        	</Text>
			        	}
			        </LinearGradient>
		        </Pressable>
			</View>

		</View>
	)
}
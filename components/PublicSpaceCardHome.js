
import {useState,useEffect} from 'react';
import axios from 'axios';
import {getSpaceWithCode} from '../utils/ApiRoutes';

export default function PublicSpaceCardHome({
	View,Text,Image,item,index,musicImage,Icon3,Pressable,
	LinearGradient,ActivityIndicator,currentSpace,navigation,
	setCurrentSpace,TrackPlayer,setCurrentSongInfo
}) {
	const [loading,setLoading] = useState(false);
	const [showInfoBox,setShowInfoBox] = useState('');
		
	const goToSpace = async() => {
		if(item){
			setLoading(true);
			const spaceCode = item?.code;
			const {data} = await axios.get(`${getSpaceWithCode}/${spaceCode}`);
			if(data.status){
				setCurrentSpace(data?.space)
				setLoading(false)
				await TrackPlayer.pause();
				await TrackPlayer.reset();
				setCurrentSongInfo("");
				navigation.navigate("Space");
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
		<View className="ml-4 bg-gray-800/60 px-3 py-3 rounded-lg 
		border-[1px] border-solid border-gray-200/50 flex flex-row items-center" >
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
				className="aspect-square rounded-lg border-[1px] w-[80px] 
				border-solid border-white"/>
			</View>
			<View className="flex ml-2 px-1">
				<Text numberOfLines={1} className="text-lg text-purple-400 font-semibold" >
					{item?.spaceName}
				</Text>
				<View className="flex mt-1 flex-row items-center" >
					<Icon3 name="user"
					size={15} color="#A4A4A4"/>
					<Text className="text-md text-gray-400 ml-2 font-semibold" >
						{item?.owner}
					</Text>
				</View>
				
				<Pressable style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1.0 }]} 
				onPress={()=>{
					if(currentSpace?.code === item?.code){
						navigation.navigate("Space");
					}else{
						goToSpace();
					}
				}} >
					<LinearGradient colors={['#9C3FE4','#C65647']}
					useAngle={true} angle={90} 
			        className="px-5 w-full py-1 mt-2 rounded-md mx-auto"
			        >	
			        	{
			        		loading ?
			        		<ActivityIndicator size={19} color="white" style={{
			        			opacity:0.7
			        		}} />
			        		:
				        	<Text style={{fontFamily:"Poppins-Medium"}} 
				        	className="text-md font-semibold mx-auto text-white" >{currentSpace?.code === item?.code ? 'Open' : 'Join'}</Text>
			        	}
			        </LinearGradient>
		        </Pressable>
			</View>

		</View>
	)
}
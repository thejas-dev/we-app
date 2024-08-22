

import {useState,useEffect} from 'react';
import axios from 'axios';
import {getSpaceWithCode,updateInSpace} from '../utils/ApiRoutes';
import {currentUserState} from '../atoms/userAtom';
import {useRecoilState} from 'recoil';
import {View,Text,Image,ActivityIndicator} from 'react-native'
import LinearGradient from 'react-native-linear-gradient';
import Icon3 from 'react-native-vector-icons/FontAwesome6';


export default function SettingSpaceCard({
	item,musicImage,
	mine
}) {
	const [loading,setLoading] = useState(false);
	const [showInfoBox,setShowInfoBox] = useState('');
	const [currentUser,setCurrentUser] = useRecoilState(currentUserState);
	
	return (
		<View className="mt-4 bg-gray-800/60 px-3 py-3 rounded-lg 
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
				<Text numberOfLines={1} className="text-xl text-purple-400 font-semibold" >
					{item?.spaceName}
				</Text>
				<View className="flex mt-1 flex-row items-center" >
					<Icon3 name={mine ? 'code' : 'user'}
					size={mine ? 16 : 17} color="#A4A4A4"/>
					{
						mine === 'true' ?
						<Text className="text-lg text-gray-400 ml-2 font-semibold" >
							{item?.code}
						</Text>
						:
						<Text className="text-lg text-gray-400 ml-2 font-semibold" >
							{item?.owner}
						</Text>
					}
					
				</View>
				
			</View>

		</View>
	)
}
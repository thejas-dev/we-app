
import Icon from 'react-native-vector-icons/Feather';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import Icon3 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon4 from 'react-native-vector-icons/Ionicons';
import {View,TouchableOpacity} from 'react-native';
import {useRecoilState} from 'recoil';
import {songPlayingState,currentSongInfoState} from '../atoms/userAtom';
import {useRef,useEffect} from 'react';

export default function Navbar({
	navigation
}) {
	const [songPlaying,setSongPlaying] = useRecoilState(songPlayingState);
	const [currentSongInfo,setCurrentSongInfo] = useRecoilState(currentSongInfoState);
	

	return (
		<View style={{
			position:"absolute",
		}} className={`fixed flex flex-row justify-around left-0 flex w-[100%] 
		bg-black/60 p-5 ${currentSongInfo ? '-bottom-[100%]' : 'bottom-0'} rounded-t-[60px] border-white/20 
		z-50 border-[1px] border-b-[0px]`} >
			<TouchableOpacity  onPress={()=>{
				navigation.navigate('Home')
			}}>
			 <Icon name="home" size={26} color="white" />
			</TouchableOpacity>
			<TouchableOpacity onPress={()=>{
				navigation.navigate('PublicSpace')
			}}>
			 <Icon2 name="people-alt" size={26} color="white" />
			</TouchableOpacity>
			<TouchableOpacity onPress={()=>{
				navigation.navigate('Setting')
			}} >
			 <Icon4 name="settings" size={25} color="white" />
			</TouchableOpacity>
		


		</View>	

	)
}
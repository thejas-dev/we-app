
import Icon from 'react-native-vector-icons/Feather';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import Icon3 from 'react-native-vector-icons/SimpleLineIcons';
import Icon4 from 'react-native-vector-icons/Octicons';
import {View,TouchableOpacity,Text} from 'react-native';

export default function NavbarPublicSpace({
	navigation,LinearGradient,setNewSpaceCreateOpen,
	setJoinWithCodeOpen,currentSongInfo
}) {
	


	return (
		<View style={{
			position:"absolute"
		}} className={`fixed flex flex-row justify-around ${currentSongInfo ? 'bottom-[65px]' : 'bottom-0'} left-0 flex w-[100%] 
		bg-black/70 px-5 py-3 border-white/20 z-50 border-[1px] border-b-[0px]`} >
			<TouchableOpacity onPress={()=>setNewSpaceCreateOpen(true)} className="w-[48%]" >
				<LinearGradient colors={['#9C3FE4','#C65647']}
				useAngle={true} angle={90} 
		        className="w-[100%] px-5 py-2 flex flex-row items-center rounded-lg mx-auto"
		        >
		        	<Icon3 name="plus" size={18} color="white"/>
			        <Text style={{fontFamily:"Poppins-Medium"}} 
				    className="text-[16px] font-semibold mx-auto text-white" >
				    	Create Space
				    </Text>
			    </LinearGradient>
			</TouchableOpacity>

			<TouchableOpacity onPress={()=>setJoinWithCodeOpen(true)} className="w-[48%]" >
				<View 
		        className="w-[100%] px-5 py-[7px] border-[1px] border-gray-500  flex flex-row items-center 
		        rounded-lg mx-auto"
		        >
		        	<Icon4 name="codespaces" size={16} color="white"/>
			        <Text style={{fontFamily:"Poppins-Medium"}} 
				    className="text-[16px] font-semibold mx-auto text-white" >
				    	Enter Code
				    </Text>
			    </View>
			</TouchableOpacity>

		</View>	

	)
}
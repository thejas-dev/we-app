
import {View,Text} from 'react-native';
import {newMessageState} from '../atoms/userAtom';
import {useRecoilState} from 'recoil';

export default function NewMessageComponent({

}) {
    const [newMessage,setNewMessage] = useRecoilState(newMessageState);
	

	return (
		<View className={`absolute bg-black/10 p-2 rounded-lg z-50 border-[1px] 
		border-solid border-gray-700 max-w-[80%] ${newMessage ? 'right-2' : '-right-[100%]'} 
		absolute top-[110px]`} >
			
			<Text numberOfLines={1} className="text-md text-gray-100" >
				{newMessage}
			</Text>
		</View>
	)
}
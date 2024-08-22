import {Modal,View,Text,Pressable,FlatList,Image,
	TextInput,TouchableOpacity,KeyboardAvoidingView } from 'react-native';
import {useRecoilState} from 'recoil';
import {chatsState} from '../atoms/userAtom';
import {host} from '../utils/ApiRoutes';
import {useState,useEffect,useRef} from 'react';
import axios from 'axios';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {socket} from '../services/socket';

export default function ChatComponent({
	openChatTab,setOpenChatTab,particleImage2,particleImage3,
	currentUser,setCurrentUser,currentSpace
}) {
	const [messageInput,setMessageInput] = useState('');
	const flatListRef = useRef(null);
	const [chats,setChats] = useRecoilState(chatsState);

	const sendMessage = async() => {
		const msgData ={
			name:currentUser?.name,
			id:currentUser?._id,
			message:messageInput,
			spaceCode:currentSpace.code
		}
		let chatsTemp = [...chats,msgData];
		setChats(chatsTemp);
		socket.emit("new-message",msgData);

		setMessageInput('');
	}

	const fetchChatsInSpaceFunc = async() => {
		const {data} = await axios.post(`${host}/getChats`,{code:currentSpace?.code});
		if(data.status){
			setChats(data?.chats);
		}
	}

	useEffect(()=>{
		if(openChatTab){
			if (flatListRef.current) {
				setTimeout(()=>{
			      flatListRef.current.scrollToEnd({ animated: true });
				},500)
		 	}
		  fetchChatsInSpaceFunc();
		}
	},[openChatTab])

	useEffect(()=>{
		if(chats.length > 0 && openChatTab){
			if (flatListRef.current) {
		    	flatListRef.current.scrollToEnd();
		    }
		}
	},[chats])

	return (
		<Modal
    animationType="slide"
    transparent={true}
    visible={openChatTab}
    className="z-0"
    onRequestClose={() => {
      setOpenChatTab(!openChatTab);
    }}>
			<SafeAreaView>
      	<View className="h-[20%] w-full">
      		<Pressable className="h-full w-full" onPress={()=>{setOpenChatTab(false)}}>

      		</Pressable>
      	</View>
      	<View className={`bg-black/80 h-[80%] w-full 
				rounded-t-2xl py-4 pb-0 flex border-t-[1px] border-x-[0.2px] relative border-gray-500`}>
				<Image source={{uri:particleImage3.uri,height:5,width:5}}
				className="absolute top-[200px] right-0 z-0 h-[100px] w-[100px]"/>
				<Image source={{uri:particleImage2.uri,height:5,width:5}}
				className="absolute top-[500px] left-[10%] z-0 h-[100px] w-[100px]"/>
				<Image source={{uri:particleImage2.uri,height:5,width:5}}
				className="absolute bottom-[150px] right-[4%] z-0 h-[100px] w-[100px]"/>
			
      	<Pressable onPress={()=> setOpenChatTab(!openChatTab)}>
					<View className="w-full my-3 flex items-center justify-center">
						<View className="rounded-full bg-gray-200 h-[6px] w-[100px]"/>
					</View>
				</Pressable>
				<View className="mt-4 border-t-[1px] flex flex-col h-full border-solid border-gray-600">
					<View className="bg-black/50 px-2 flex flex-col py-1 h-[93%]">
						<FlatList ref={flatListRef} data={chats}
						keyExtractor={(contact, index) => String(index)}
						ListFooterComponent={()=>(
							<View className="my-1"/>
						)}
						renderItem={({item,index})=>(
							<View className="flex flex-col px-3 py-2 mt-3 rounded-lg border-[1px] 
							border-gray-600 bg-black/60 max-w-[70%]">
								<Text numberOfLines={1} className="text-sm text-blue-300">
									{item?.name}
								</Text>
								<Text className="text-[16px] mt-1 font-semibold text-gray-100">
									{item?.message}
								</Text>
							</View>
						)}/>
						
						<View className="border-t-[1px] bg-black/50  max-h-[15%] w-full border-solid border-gray-700 p-2">
							<View className="rounded-lg h-full flex flex-row justify-between px-4 items-center border-solid 
							border-[1px] border-gray-600  bg-black">
								<TextInput value={messageInput} onChangeText={(e)=>setMessageInput(e)} placeholder="Type Something Here"
								className="text-white text-[18px] w-[85%] rounded-lg" />
								<TouchableOpacity onPress={()=>{if(messageInput?.length > 0) sendMessage()}}>
									<Icon name="send" color={messageInput.length > 0 ? 'white' : 'gray'} size={29}/>
								</TouchableOpacity>
							</View>
						</View>
					</View>



				</View>
			</View>


    	</SafeAreaView>
		
    </Modal>


	)
}
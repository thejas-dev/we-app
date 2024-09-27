import {View,Text,StyleSheet,Animated,Vibration} from 'react-native'
import LinearGradient from 'react-native-linear-gradient';
import {useRecoilState} from 'recoil';
import {newUserDataState} from '../atoms/userAtom';
import {useState,useEffect,useRef} from 'react';


export default function NewUserAlert() {

	const [newUserData,setNewUserData] = useRecoilState(newUserDataState);
	const slideAnim = useRef(new Animated.Value(500)).current;

	useEffect(()=>{
		if (newUserData) {
			Vibration.vibrate();
      // Slide in the alert box
      Animated.timing(slideAnim, {
        toValue: 0, // Slide in to the visible position
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Slide out the alert box after 5 seconds
      setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: 500, // Slide out to the right
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 5000);
    }
	},[newUserData,slideAnim])

	return (
		<Animated.View
	      style={[
	        styles.alertBox,
	        {
	          transform: [{ translateX: slideAnim }],
	        },
	      ]}
	    >
	      <LinearGradient
	        colors={['#000060', '#410752']}
	        style={{ flex: 1 }}
	        start={{ x: 0.5, y: 0 }}
	        end={{ x: 0.5, y: 1 }}
	        className="px-3 py-1 absolute opacity-[0.9] top-12 max-w-[80%] right-3 border-[1px] border-gray-300/50 rounded-lg"
	      >
	        <Text
	          numberOfLines={1}
	          style={{ fontFamily: 'Poppins-Medium' }}
	          className="text-[16px] font-semibold text-white"
	        >
	          {newUserData.status} {newUserData?.name}
	        </Text>
	      </LinearGradient>
	    </Animated.View>
	)
}

const styles = StyleSheet.create({
  alertBox: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '80%',
    maxWidth: '80%',
  },
});
import AppNavigation from './navigation/appNavigation';
import { NativeWindStyleSheet } from "nativewind";
import { RecoilRoot } from "recoil";


NativeWindStyleSheet.setOutput({
  default: "native",
});

export default function App() {
  return (
    <RecoilRoot>
      <AppNavigation />
    </RecoilRoot>
  );
}

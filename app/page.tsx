'use client';

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
  Switch,
  Tab,
  Tabs,
  useDisclosure,
} from '@nextui-org/react';
import {useEffect, useMemo, useState} from 'react';

type Screen = 'login' | 'signup' | 'phone' | 'welcome' | 'home' | 'detail';
type DetailKind = 'scan' | 'history' | 'settings' | 'guide';

type User = {
  name: string;
  phone: string;
  email: string;
};

type ScanRecord = {
  id: number;
  title: string;
  result: string;
  time: string;
  status: 'safe' | 'watch' | 'blocked';
};

const INITIAL_USER: User = {
  name: '민준',
  phone: '01012345678',
  email: 'toss@safe.app',
};

const statusCopy = {
  safe: '안전',
  watch: '확인 필요',
  blocked: '차단됨',
};

const statusColor = {
  safe: 'success',
  watch: 'warning',
  blocked: 'danger',
} as const;

const baseHistory: ScanRecord[] = [
  {id: 1, title: '앱 설치 파일 42개', result: '위험한 항목이 없어요', time: '방금 전', status: 'safe'},
  {id: 2, title: '문자 링크 보호', result: '의심 링크 1개를 막았어요', time: '어제', status: 'blocked'},
  {id: 3, title: '권한 점검', result: '카메라 권한 앱 2개 확인 필요', time: '2일 전', status: 'watch'},
];

export default function TossVaccineApp() {
  const [screen, setScreen] = useState<Screen>('login');
  const [detail, setDetail] = useState<DetailKind>('scan');
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [form, setForm] = useState({name: '', email: '', password: '', phone: '', code: ''});
  const [loggedIn, setLoggedIn] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [history, setHistory] = useState<ScanRecord[]>(baseHistory);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [autoProtect, setAutoProtect] = useState(true);
  const [linkGuard, setLinkGuard] = useState(true);
  const [wifiGuard, setWifiGuard] = useState(false);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  useEffect(() => {
    const saved = window.localStorage.getItem('toss-vaccine-user');
    if (saved) {
      setUser(JSON.parse(saved));
      setLoggedIn(true);
      setScreen('home');
    }
  }, []);

  useEffect(() => {
    if (!timer) {
      return;
    }
    const timeout = window.setTimeout(() => setTimer((value) => value - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [timer]);

  useEffect(() => {
    if (!isScanning) {
      return;
    }
    const interval = window.setInterval(() => {
      setScanProgress((progress) => {
        if (progress >= 100) {
          window.clearInterval(interval);
          setIsScanning(false);
          setHistory((items) => [
            {
              id: Date.now(),
              title: '전체 기기 검사',
              result: '지금은 걱정할 게 없어요',
              time: '방금 전',
              status: 'safe',
            },
            ...items,
          ]);
          onOpen();
          return 100;
        }
        return progress + 4;
      });
    }, 130);
    return () => window.clearInterval(interval);
  }, [isScanning, onOpen]);

  const safeScore = useMemo(() => {
    const deduction = history.filter((item) => item.status !== 'safe').length * 4;
    return Math.max(82, 96 - deduction + (autoProtect ? 3 : 0) + (linkGuard ? 2 : 0));
  }, [autoProtect, history, linkGuard]);

  const goDetail = (kind: DetailKind) => {
    setDetail(kind);
    setScreen('detail');
  };

  const login = () => {
    setLoggedIn(true);
    setScreen('home');
  };

  const createAccount = () => {
    setUser({
      name: form.name || '토스',
      email: form.email || 'safe@toss.app',
      phone: form.phone || '01012345678',
    });
    setScreen('phone');
  };

  const sendOtp = () => {
    setOtpSent(true);
    setTimer(59);
    setForm((value) => ({...value, code: '123456'}));
  };

  const verifyPhone = () => {
    window.localStorage.setItem('toss-vaccine-user', JSON.stringify(user));
    setScreen('welcome');
  };

  const startScan = () => {
    setScanProgress(0);
    setIsScanning(true);
    setDetail('scan');
    setScreen('detail');
  };

  const logout = () => {
    window.localStorage.removeItem('toss-vaccine-user');
    setLoggedIn(false);
    setScreen('login');
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 text-[#191F28]">
      <section className="relative h-[844px] w-full max-w-[390px] overflow-hidden rounded-[36px] border border-white bg-[#F7F8FA] shadow-toss">
        <div className="absolute left-0 top-0 h-48 w-full bg-gradient-to-b from-[#E8F3FF] to-transparent" />
        <div className="relative flex h-full flex-col">
          <PhoneStatus />
          {screen !== 'login' && screen !== 'signup' && screen !== 'phone' && screen !== 'welcome' ? (
            <AppHeader user={user} onSettings={() => goDetail('settings')} />
          ) : null}
          <div className="toss-scrollbar flex-1 overflow-y-auto px-5 pb-24 pt-2">
            {screen === 'login' ? <LoginScreen form={form} setForm={setForm} onLogin={login} onSignup={() => setScreen('signup')} /> : null}
            {screen === 'signup' ? (
              <SignupScreen form={form} setForm={setForm} onBack={() => setScreen('login')} onNext={createAccount} />
            ) : null}
            {screen === 'phone' ? (
              <PhoneScreen
                form={form}
                setForm={setForm}
                timer={timer}
                otpSent={otpSent}
                onBack={() => setScreen('signup')}
                onSend={sendOtp}
                onVerify={verifyPhone}
              />
            ) : null}
            {screen === 'welcome' ? <WelcomeScreen user={user} onStart={() => setScreen('home')} /> : null}
            {screen === 'home' ? (
              <HomeScreen
                user={user}
                safeScore={safeScore}
                history={history}
                autoProtect={autoProtect}
                linkGuard={linkGuard}
                wifiGuard={wifiGuard}
                onScan={startScan}
                onDetail={goDetail}
              />
            ) : null}
            {screen === 'detail' ? (
              <DetailScreen
                detail={detail}
                setDetail={setDetail}
                scanProgress={scanProgress}
                isScanning={isScanning}
                history={history}
                autoProtect={autoProtect}
                linkGuard={linkGuard}
                wifiGuard={wifiGuard}
                setAutoProtect={setAutoProtect}
                setLinkGuard={setLinkGuard}
                setWifiGuard={setWifiGuard}
                onBack={() => setScreen('home')}
                onScan={startScan}
                onLogout={logout}
              />
            ) : null}
          </div>
          {loggedIn && screen !== 'login' && screen !== 'signup' && screen !== 'phone' && screen !== 'welcome' ? (
            <BottomNav active={screen === 'detail' ? detail : 'home'} onHome={() => setScreen('home')} onDetail={goDetail} />
          ) : null}
        </div>
      </section>
      <Modal isOpen={isOpen} placement="center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">검사가 끝났어요</ModalHeader>
              <ModalBody>
                <p className="text-[15px] leading-7 text-[#4E5968]">위험한 항목은 발견되지 않았어요. 오늘도 휴대전화를 안전하게 지키고 있어요.</p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" radius="full" onPress={onClose}>
                  확인했어요
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
}

function PhoneStatus() {
  return (
    <div className="relative z-10 flex items-center justify-between px-7 pt-4 text-[13px] font-bold text-[#191F28]">
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span>5G</span>
        <span className="h-3 w-5 rounded-[4px] border-2 border-[#191F28]" />
      </div>
    </div>
  );
}

function AppHeader({user, onSettings}: {user: User; onSettings: () => void}) {
  return (
    <header className="relative z-10 flex items-center justify-between px-5 pb-2 pt-5">
      <div>
        <p className="text-[13px] font-semibold text-[#8B95A1]">토스백신</p>
        <h1 className="mt-1 text-[22px] font-extrabold tracking-[-0.04em]">{user.name}님, 안심하세요</h1>
      </div>
      <Badge color="success" content="ON" placement="bottom-right" size="sm">
        <Avatar className="bg-[#E8F3FF] text-[#3182F6]" name={user.name.slice(0, 1)} />
      </Badge>
      <button aria-label="설정" className="absolute right-5 top-[72px] text-[13px] font-bold text-[#3182F6]" onClick={onSettings}>
        설정
      </button>
    </header>
  );
}

function LoginScreen({
  form,
  setForm,
  onLogin,
  onSignup,
}: {
  form: Record<string, string>;
  setForm: (value: any) => void;
  onLogin: () => void;
  onSignup: () => void;
}) {
  return (
    <div className="flex min-h-[760px] flex-col justify-between pt-12">
      <div>
        <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#3182F6] text-3xl text-white">✓</div>
        <h1 className="text-[32px] font-black leading-[1.18] tracking-[-0.06em]">휴대전화 보안도<br />토스처럼 쉽게</h1>
        <p className="mt-4 text-[16px] font-semibold leading-7 text-[#6B7684]">복잡한 백신 설정은 줄이고, 꼭 필요한 보호만 한눈에 보여드릴게요.</p>
        <div className="mt-10 space-y-3">
          <Input
            radius="lg"
            size="lg"
            label="이메일"
            placeholder="safe@toss.app"
            value={form.email}
            onValueChange={(email) => setForm((value: any) => ({...value, email}))}
          />
          <Input
            radius="lg"
            size="lg"
            label="비밀번호"
            placeholder="8자리 이상"
            type="password"
            value={form.password}
            onValueChange={(password) => setForm((value: any) => ({...value, password}))}
          />
        </div>
      </div>
      <div className="space-y-3 pb-3">
        <Button fullWidth color="primary" radius="full" size="lg" className="h-14 text-[16px] font-bold" onPress={onLogin}>
          로그인하기
        </Button>
        <Button fullWidth variant="light" radius="full" size="lg" className="h-13 text-[15px] font-bold text-[#4E5968]" onPress={onSignup}>
          처음이라면 가입하기
        </Button>
      </div>
    </div>
  );
}

function SignupScreen({form, setForm, onBack, onNext}: {form: Record<string, string>; setForm: (value: any) => void; onBack: () => void; onNext: () => void}) {
  return (
    <StackPage eyebrow="회원가입" title={'딱 필요한 정보만\n받을게요'} onBack={onBack}>
      <div className="mt-8 space-y-3">
        <Input radius="lg" size="lg" label="이름" placeholder="홍길동" value={form.name} onValueChange={(name) => setForm((value: any) => ({...value, name}))} />
        <Input radius="lg" size="lg" label="이메일" placeholder="safe@toss.app" value={form.email} onValueChange={(email) => setForm((value: any) => ({...value, email}))} />
        <Input radius="lg" size="lg" label="비밀번호" placeholder="8자리 이상" type="password" value={form.password} onValueChange={(password) => setForm((value: any) => ({...value, password}))} />
      </div>
      <BottomCTA label="휴대전화 인증하기" onPress={onNext} />
    </StackPage>
  );
}

function PhoneScreen({
  form,
  setForm,
  timer,
  otpSent,
  onBack,
  onSend,
  onVerify,
}: {
  form: Record<string, string>;
  setForm: (value: any) => void;
  timer: number;
  otpSent: boolean;
  onBack: () => void;
  onSend: () => void;
  onVerify: () => void;
}) {
  return (
    <StackPage eyebrow="휴대전화 인증" title={'본인 휴대전화인지\n확인할게요'} onBack={onBack}>
      <div className="mt-8 space-y-3">
        <Input radius="lg" size="lg" label="휴대전화 번호" placeholder="01012345678" value={form.phone} onValueChange={(phone) => setForm((value: any) => ({...value, phone}))} />
        <Button fullWidth variant="flat" color="primary" radius="full" className="h-12 font-bold" onPress={onSend}>
          {otpSent ? `인증번호 다시 받기 ${timer ? `${timer}s` : ''}` : '인증번호 받기'}
        </Button>
        {otpSent ? (
          <Input radius="lg" size="lg" label="인증번호" description="프로토타입에서는 123456이 자동 입력돼요." value={form.code} onValueChange={(code) => setForm((value: any) => ({...value, code}))} />
        ) : null}
      </div>
      <BottomCTA label="인증 완료" disabled={!otpSent} onPress={onVerify} />
    </StackPage>
  );
}

function WelcomeScreen({user, onStart}: {user: User; onStart: () => void}) {
  return (
    <div className="flex min-h-[760px] flex-col justify-between pt-20 text-center">
      <div>
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-[#E8F3FF] text-5xl">🛡️</div>
        <h1 className="whitespace-pre-line text-[32px] font-black leading-[1.2] tracking-[-0.06em]">{`${user.name}님,\n이제 안전해요`}</h1>
        <p className="mt-4 text-[16px] font-semibold leading-7 text-[#6B7684]">검사, 차단, 기록 확인까지 한 화면에서 자연스럽게 이어져요.</p>
      </div>
      <Button fullWidth color="primary" radius="full" size="lg" className="mb-3 h-14 text-[16px] font-bold" onPress={onStart}>
        시작하기
      </Button>
    </div>
  );
}

function HomeScreen({
  user,
  safeScore,
  history,
  autoProtect,
  linkGuard,
  wifiGuard,
  onScan,
  onDetail,
}: {
  user: User;
  safeScore: number;
  history: ScanRecord[];
  autoProtect: boolean;
  linkGuard: boolean;
  wifiGuard: boolean;
  onScan: () => void;
  onDetail: (kind: DetailKind) => void;
}) {
  return (
    <div className="space-y-5 pt-2">
      <Card shadow="none" radius="lg" className="bg-white">
        <CardBody className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#6B7684]">오늘의 보안 점수</p>
              <div className="mt-2 flex items-end gap-1"><strong className="text-[52px] leading-none tracking-[-0.07em]">{safeScore}</strong><span className="pb-2 text-[20px] font-black">점</span></div>
            </div>
            <Chip color="success" variant="flat" className="font-bold">좋아요</Chip>
          </div>
          <Progress className="mt-5" color="primary" radius="full" size="sm" value={safeScore} />
          <p className="mt-4 text-[15px] font-semibold leading-7 text-[#4E5968]">{user.name}님의 휴대전화는 주요 보호 기능이 켜져 있어요.</p>
          <Button fullWidth color="primary" radius="full" size="lg" className="mt-5 h-14 text-[16px] font-bold" onPress={onScan}>
            지금 검사하기
          </Button>
        </CardBody>
      </Card>
      <div className="grid grid-cols-3 gap-3">
        <MiniStatus title="실시간" active={autoProtect} />
        <MiniStatus title="링크" active={linkGuard} />
        <MiniStatus title="Wi-Fi" active={wifiGuard} />
      </div>
      <SectionTitle title="빠른 보호" action="전체보기" onAction={() => onDetail('guide')} />
      <div className="space-y-3">
        <ActionRow icon="🔍" title="전체 기기 검사" desc="앱, 파일, 권한을 빠르게 확인해요" onPress={() => onDetail('scan')} />
        <ActionRow icon="🔗" title="문자 링크 보호" desc="피싱으로 의심되는 주소를 알려줘요" onPress={() => onDetail('guide')} />
        <ActionRow icon="📶" title="공용 Wi-Fi 점검" desc="안전하지 않은 네트워크를 확인해요" onPress={() => onDetail('settings')} />
      </div>
      <SectionTitle title="최근 기록" action="더보기" onAction={() => onDetail('history')} />
      <div className="space-y-3">
        {history.slice(0, 2).map((item) => <HistoryRow key={item.id} item={item} />)}
      </div>
    </div>
  );
}

function DetailScreen({
  detail,
  setDetail,
  scanProgress,
  isScanning,
  history,
  autoProtect,
  linkGuard,
  wifiGuard,
  setAutoProtect,
  setLinkGuard,
  setWifiGuard,
  onBack,
  onScan,
  onLogout,
}: {
  detail: DetailKind;
  setDetail: (kind: DetailKind) => void;
  scanProgress: number;
  isScanning: boolean;
  history: ScanRecord[];
  autoProtect: boolean;
  linkGuard: boolean;
  wifiGuard: boolean;
  setAutoProtect: (value: boolean) => void;
  setLinkGuard: (value: boolean) => void;
  setWifiGuard: (value: boolean) => void;
  onBack: () => void;
  onScan: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="pt-1">
      <Button variant="light" radius="full" className="mb-2 -ml-2 font-bold text-[#4E5968]" onPress={onBack}>← 홈으로</Button>
      <Tabs selectedKey={detail} onSelectionChange={(key) => setDetail(key as DetailKind)} color="primary" radius="full" variant="light" className="mb-4">
        <Tab key="scan" title="검사" />
        <Tab key="history" title="기록" />
        <Tab key="settings" title="설정" />
        <Tab key="guide" title="가이드" />
      </Tabs>
      {detail === 'scan' ? <ScanDetail scanProgress={scanProgress} isScanning={isScanning} onScan={onScan} /> : null}
      {detail === 'history' ? <HistoryDetail history={history} /> : null}
      {detail === 'settings' ? (
        <SettingsDetail
          autoProtect={autoProtect}
          linkGuard={linkGuard}
          wifiGuard={wifiGuard}
          setAutoProtect={setAutoProtect}
          setLinkGuard={setLinkGuard}
          setWifiGuard={setWifiGuard}
          onLogout={onLogout}
        />
      ) : null}
      {detail === 'guide' ? <GuideDetail /> : null}
    </div>
  );
}

function ScanDetail({scanProgress, isScanning, onScan}: {scanProgress: number; isScanning: boolean; onScan: () => void}) {
  return (
    <div className="space-y-5">
      <Card shadow="none" radius="lg" className="bg-white">
        <CardBody className="p-6 text-center">
          <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-[#E8F3FF] text-5xl">🔎</div>
          <h2 className="text-[28px] font-black tracking-[-0.06em]">{isScanning ? '꼼꼼히 보는 중이에요' : '검사를 시작해볼까요?'}</h2>
          <p className="mt-3 text-[15px] font-semibold leading-7 text-[#6B7684]">백신 엔진은 실제 동작하지 않지만, 검사 흐름과 기록 저장은 작동해요.</p>
          <Progress className="mt-6" color="primary" radius="full" value={scanProgress} />
          <Button fullWidth color="primary" radius="full" size="lg" className="mt-6 h-14 font-bold" isLoading={isScanning} onPress={onScan}>
            {isScanning ? `${scanProgress}% 검사 중` : '전체 검사 시작'}
          </Button>
        </CardBody>
      </Card>
      <ActionRow icon="📁" title="파일 검사" desc="다운로드 폴더를 확인해요" />
      <ActionRow icon="📱" title="앱 권한 검사" desc="과도한 권한을 가진 앱을 알려줘요" />
      <ActionRow icon="💬" title="문자 링크 검사" desc="최근 받은 링크의 위험도를 살펴봐요" />
    </div>
  );
}

function HistoryDetail({history}: {history: ScanRecord[]}) {
  return (
    <div className="space-y-3">
      <h2 className="mb-4 text-[26px] font-black tracking-[-0.06em]">보안 기록</h2>
      {history.map((item) => <HistoryRow key={item.id} item={item} />)}
    </div>
  );
}

function SettingsDetail({
  autoProtect,
  linkGuard,
  wifiGuard,
  setAutoProtect,
  setLinkGuard,
  setWifiGuard,
  onLogout,
}: {
  autoProtect: boolean;
  linkGuard: boolean;
  wifiGuard: boolean;
  setAutoProtect: (value: boolean) => void;
  setLinkGuard: (value: boolean) => void;
  setWifiGuard: (value: boolean) => void;
  onLogout: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-[26px] font-black tracking-[-0.06em]">보호 설정</h2>
      <SettingRow title="실시간 보호" desc="새 앱과 파일을 자동으로 살펴봐요" selected={autoProtect} onChange={setAutoProtect} />
      <SettingRow title="문자 링크 보호" desc="위험한 링크를 누르기 전에 알려줘요" selected={linkGuard} onChange={setLinkGuard} />
      <SettingRow title="공용 Wi-Fi 알림" desc="안전하지 않은 네트워크를 알려줘요" selected={wifiGuard} onChange={setWifiGuard} />
      <Divider className="my-4" />
      <Button fullWidth color="danger" variant="flat" radius="full" className="h-12 font-bold" onPress={onLogout}>로그아웃</Button>
    </div>
  );
}

function GuideDetail() {
  return (
    <div className="space-y-4">
      <h2 className="text-[26px] font-black tracking-[-0.06em]">안전하게 쓰는 법</h2>
      <GuideCard step="1" title="모르는 링크는 한 번 더 확인해요" desc="짧은 주소, 급한 입금 요청, 택배 사칭 문자는 바로 열지 않는 게 좋아요." />
      <GuideCard step="2" title="앱 권한은 필요한 만큼만" desc="연락처, 위치, 카메라 권한은 자주 확인하고 쓰지 않는 앱은 정리해요." />
      <GuideCard step="3" title="공용 Wi-Fi에서는 조심해요" desc="로그인이나 결제는 신뢰할 수 있는 네트워크에서 하는 걸 권장해요." />
    </div>
  );
}

function StackPage({eyebrow, title, onBack, children}: {eyebrow: string; title: string; onBack: () => void; children: React.ReactNode}) {
  return (
    <div className="min-h-[760px] pt-5">
      <Button variant="light" radius="full" className="-ml-2 mb-7 font-bold text-[#4E5968]" onPress={onBack}>← 뒤로</Button>
      <p className="text-[14px] font-bold text-[#3182F6]">{eyebrow}</p>
      <h1 className="mt-3 whitespace-pre-line text-[31px] font-black leading-[1.2] tracking-[-0.06em]">{title}</h1>
      <p className="mt-4 text-[16px] font-semibold leading-7 text-[#6B7684]">쉽고 빠르게 끝낼 수 있게 준비했어요.</p>
      {children}
    </div>
  );
}

function BottomCTA({label, disabled, onPress}: {label: string; disabled?: boolean; onPress: () => void}) {
  return (
    <div className="absolute bottom-5 left-5 right-5">
      <Button fullWidth color="primary" radius="full" size="lg" className="h-14 text-[16px] font-bold" isDisabled={disabled} onPress={onPress}>
        {label}
      </Button>
    </div>
  );
}

function MiniStatus({title, active}: {title: string; active: boolean}) {
  return (
    <Card shadow="none" radius="lg" className="bg-white">
      <CardBody className="items-center p-3 text-center">
        <span className={`mb-2 h-2 w-2 rounded-full ${active ? 'bg-[#20C997]' : 'bg-[#D1D6DB]'}`} />
        <strong className="text-[14px]">{title}</strong>
        <span className="mt-1 text-[12px] font-bold text-[#8B95A1]">{active ? '켜짐' : '꺼짐'}</span>
      </CardBody>
    </Card>
  );
}

function SectionTitle({title, action, onAction}: {title: string; action: string; onAction: () => void}) {
  return (
    <div className="flex items-center justify-between pt-2">
      <h2 className="text-[20px] font-black tracking-[-0.04em]">{title}</h2>
      <Button variant="light" color="primary" radius="full" size="sm" className="font-bold" onPress={onAction}>{action}</Button>
    </div>
  );
}

function ActionRow({icon, title, desc, onPress}: {icon: string; title: string; desc: string; onPress?: () => void}) {
  return (
    <Card isPressable={Boolean(onPress)} shadow="none" radius="lg" className="w-full bg-white" onPress={onPress}>
      <CardBody className="flex-row items-center gap-4 p-4 text-left">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#F2F4F6] text-2xl">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-black tracking-[-0.03em]">{title}</p>
          <p className="mt-1 truncate text-[13px] font-semibold text-[#8B95A1]">{desc}</p>
        </div>
        <span className="font-black text-[#B0B8C1]">›</span>
      </CardBody>
    </Card>
  );
}

function HistoryRow({item}: {item: ScanRecord}) {
  return (
    <Card shadow="none" radius="lg" className="bg-white">
      <CardBody className="flex-row items-center justify-between gap-3 p-4">
        <div>
          <p className="text-[16px] font-black tracking-[-0.03em]">{item.title}</p>
          <p className="mt-1 text-[13px] font-semibold text-[#8B95A1]">{item.result} · {item.time}</p>
        </div>
        <Chip color={statusColor[item.status]} variant="flat" size="sm" className="shrink-0 font-bold">{statusCopy[item.status]}</Chip>
      </CardBody>
    </Card>
  );
}

function SettingRow({title, desc, selected, onChange}: {title: string; desc: string; selected: boolean; onChange: (value: boolean) => void}) {
  return (
    <Card shadow="none" radius="lg" className="bg-white">
      <CardBody className="flex-row items-center justify-between gap-3 p-4">
        <div>
          <p className="text-[16px] font-black tracking-[-0.03em]">{title}</p>
          <p className="mt-1 text-[13px] font-semibold leading-5 text-[#8B95A1]">{desc}</p>
        </div>
        <Switch color="primary" isSelected={selected} onValueChange={onChange} />
      </CardBody>
    </Card>
  );
}

function GuideCard({step, title, desc}: {step: string; title: string; desc: string}) {
  return (
    <Card shadow="none" radius="lg" className="bg-white">
      <CardBody className="p-5">
        <Chip color="primary" variant="flat" className="mb-4 font-bold">{step}</Chip>
        <h3 className="text-[18px] font-black tracking-[-0.04em]">{title}</h3>
        <p className="mt-2 text-[14px] font-semibold leading-6 text-[#6B7684]">{desc}</p>
      </CardBody>
    </Card>
  );
}

function BottomNav({active, onHome, onDetail}: {active: string; onHome: () => void; onDetail: (kind: DetailKind) => void}) {
  const items = [
    {key: 'home', label: '홈', action: onHome},
    {key: 'scan', label: '검사', action: () => onDetail('scan')},
    {key: 'history', label: '기록', action: () => onDetail('history')},
    {key: 'settings', label: '설정', action: () => onDetail('settings')},
  ];
  return (
    <nav className="absolute bottom-0 left-0 right-0 z-20 border-t border-[#E5E8EB] bg-white/95 px-3 pb-4 pt-2 backdrop-blur">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => (
          <Button key={item.key} variant="light" radius="full" className={`h-12 min-w-0 font-black ${active === item.key ? 'text-[#3182F6]' : 'text-[#8B95A1]'}`} onPress={item.action}>
            {item.label}
          </Button>
        ))}
      </div>
    </nav>
  );
}

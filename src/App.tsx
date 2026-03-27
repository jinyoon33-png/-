import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Calendar, ChevronRight, ChevronLeft, Save, Trash2, User, AlertCircle, CheckCircle2, TrendingUp, ShieldAlert } from 'lucide-react';

// --- Types & Initial Data ---
type Phase = 'offseason' | 'inseason';
type TrainTime = 'short' | 'medium' | 'long';

interface FormData {
  id?: number;
  name: string;
  age: string;
  exp: string;
  height: string;
  weight: string;
  season: Phase;
  gameDate: string;
  trainTime: TrainTime;
  painList: string[];
  injuryDate: string;
  recovery: number;
  sprint: number;
  dl: number;
  back: number;
  shoulder: number;
  hip: number;
  week?: number;
}

const initialFormData: FormData = {
  name: '', age: '', exp: '', height: '', weight: '',
  season: 'offseason', gameDate: '', trainTime: 'medium',
  painList: ['none'], injuryDate: '', recovery: 50,
  sprint: 3, dl: 3, back: 3, shoulder: 3, hip: 3
};

// --- Helper: Age-based Options ---
const getAgeGroup = (age: number) => {
  if (age <= 12) return 'U12';
  if (age <= 15) return 'U15';
  if (age <= 18) return 'U18';
  return 'ADULT';
};

const getAssessmentOptions = (ageGroup: string) => {
  const options = {
    U12: {
      title: "[U-12 초등부]",
      dlLabel: "🏋️ 하체 기초 (맨몸 스쿼트 연속 갯수 측정)",
      dlHelper: "💡 관절 보호를 위해 바벨 대신 맨몸 스쿼트 연속 수행 능력을 평가합니다.",
      backLabel: "💪 등/후면 근력 (턱걸이 갯수, 감속 능력)",
      sprint: [
        { v: 1, t: "1단계: 16.5초 이상 (순발력 개선 필요)" },
        { v: 2, t: "2단계: 15.5초 ~ 16.4초" },
        { v: 3, t: "3단계: 14.5초 ~ 15.4초 (초등부 보통)" },
        { v: 4, t: "4단계: 13.5초 ~ 14.4초 (빠름)" },
        { v: 5, t: "5단계: 13.4초 이하 (초등 엘리트 최고 수준)" }
      ],
      dl: [
        { v: 1, t: "1단계: 맨몸 스쿼트 10개 미만 (기초 체력 시급)" },
        { v: 2, t: "2단계: 맨몸 스쿼트 10~19개" },
        { v: 3, t: "3단계: 맨몸 스쿼트 20~29개 (초등부 적정)" },
        { v: 4, t: "4단계: 맨몸 스쿼트 30~49개 연속 가능 (근지구력 우수)" },
        { v: 5, t: "5단계: 맨몸 스쿼트 50개 이상 거뜬함 (하체 밸런스 완벽)" }
      ],
      back: [
        { v: 1, t: "1단계: 푸시업 5개 미만, 턱걸이 아예 불가 (상체 취약)" },
        { v: 2, t: "2단계: 푸시업 10개 가능, 턱걸이 0개" },
        { v: 3, t: "3단계: 푸시업 15개 이상, 턱걸이 1~2개 가능 (보통)" },
        { v: 4, t: "4단계: 턱걸이 3~5개 가능 (상체 근력 우수)" },
        { v: 5, t: "5단계: 턱걸이 6개 이상 가능 (매우 우수함)" }
      ]
    },
    U15: {
      title: "[U-15 중등부]",
      dlLabel: "🏋️ 데드리프트 1RM (체중 대비 배수)",
      dlHelper: "💡 1번 겨우 들 수 있는 무게를 본인 체중으로 나눈 배수입니다.",
      backLabel: "💪 등/후면 근력 (턱걸이 갯수, 감속 능력)",
      sprint: [
        { v: 1, t: "1단계: 15.5초 이상 (순발력 매우 부족)" },
        { v: 2, t: "2단계: 14.5초 ~ 15.4초 (다소 느림)" },
        { v: 3, t: "3단계: 13.5초 ~ 14.4초 (중등부 보통 수준)" },
        { v: 4, t: "4단계: 12.5초 ~ 13.4초 (순발력 우수함)" },
        { v: 5, t: "5단계: 12.4초 이하 (중학 엘리트 최고 수준)" }
      ],
      dl: [
        { v: 1, t: "1단계: 체중 0.8배 미만 (기초 근력 부족)" },
        { v: 2, t: "2단계: 체중 0.8배 ~ 0.9배" },
        { v: 3, t: "3단계: 체중 1.0배 ~ 1.2배 (중등부 적정)" },
        { v: 4, t: "4단계: 체중 1.3배 ~ 1.4배 (근력 우수)" },
        { v: 5, t: "5단계: 체중 1.5배 이상 (스트렝스 엘리트 수준)" }
      ],
      back: [
        { v: 1, t: "1단계: 0개 (상체 근력 시급)" },
        { v: 2, t: "2단계: 1개 ~ 2개" },
        { v: 3, t: "3단계: 3개 ~ 5개 (중등부 보통)" },
        { v: 4, t: "4단계: 6개 ~ 9개 (우수함)" },
        { v: 5, t: "5단계: 10개 이상 (매우 우수함)" }
      ]
    },
    U18: {
      title: "[U-18 고등부 엘리트]",
      dlLabel: "🏋️ 데드리프트 1RM (체중 대비 배수)",
      dlHelper: "💡 1번 겨우 들 수 있는 무게를 본인 체중으로 나눈 배수입니다.",
      backLabel: "💪 등/후면 근력 (턱걸이 갯수, 감속 능력)",
      sprint: [
        { v: 1, t: "1단계: 14.5초 이상 (순발력 심각)" },
        { v: 2, t: "2단계: 13.5초 ~ 14.4초" },
        { v: 3, t: "3단계: 12.5초 ~ 13.4초 (고등부 보통)" },
        { v: 4, t: "4단계: 11.8초 ~ 12.4초 (우수함)" },
        { v: 5, t: "5단계: 11.7초 이하 (고등 엘리트 최고 수준)" }
      ],
      dl: [
        { v: 1, t: "1단계: 체중 1.0배 미만 (웨이트 시급함)" },
        { v: 2, t: "2단계: 체중 1.0배 ~ 1.2배" },
        { v: 3, t: "3단계: 체중 1.3배 ~ 1.5배 (고등부 적정 기준)" },
        { v: 4, t: "4단계: 체중 1.6배 ~ 1.7배 (스트렝스 우수)" },
        { v: 5, t: "5단계: 체중 1.8배 이상 (파워 훈련 전환기)" }
      ],
      back: [
        { v: 1, t: "1단계: 0개 ~ 2개 (어깨 부상 위험 극도)" },
        { v: 2, t: "2단계: 3개 ~ 5개" },
        { v: 3, t: "3단계: 6개 ~ 8개 (고등부 보통)" },
        { v: 4, t: "4단계: 9개 ~ 11개" },
        { v: 5, t: "5단계: 12개 이상 (감속 능력 매우 우수)" }
      ]
    },
    ADULT: {
      title: "[성인/대학부 아마추어]",
      dlLabel: "🏋️ 데드리프트 1RM (체중 대비 배수)",
      dlHelper: "💡 1번 겨우 들 수 있는 무게를 본인 체중으로 나눈 배수입니다.",
      backLabel: "💪 등/후면 근력 (턱걸이 갯수, 감속 능력)",
      sprint: [
        { v: 1, t: "1단계: 14.0초 이상 (순발력 상실)" },
        { v: 2, t: "2단계: 13.0초 ~ 13.9초" },
        { v: 3, t: "3단계: 12.0초 ~ 12.9초 (성인 평균)" },
        { v: 4, t: "4단계: 11.5초 ~ 11.9초 (빠른 편)" },
        { v: 5, t: "5단계: 11.4초 이하 (프로급 폭발력)" }
      ],
      dl: [
        { v: 1, t: "1단계: 체중 1.2배 미만 (기반 붕괴)" },
        { v: 2, t: "2단계: 체중 1.2배 ~ 1.4배" },
        { v: 3, t: "3단계: 체중 1.5배 ~ 1.7배 (권장 최소치)" },
        { v: 4, t: "4단계: 체중 1.8배 ~ 1.9배 (스트렝스 우수)" },
        { v: 5, t: "5단계: 체중 2.0배 이상 (피지컬 완성)" }
      ],
      back: [
        { v: 1, t: "1단계: 0개 ~ 3개 (어깨 후면 파열 주의)" },
        { v: 2, t: "2단계: 4개 ~ 7개" },
        { v: 3, t: "3단계: 8개 ~ 10개 (보통)" },
        { v: 4, t: "4단계: 11개 ~ 14개 (우수함)" },
        { v: 5, t: "5단계: 15개 이상 또는 +15kg 중량 풀업 (완성형)" }
      ]
    }
  };
  return options[ageGroup as keyof typeof options];
};

// --- Main App Component ---
export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [savedPlayers, setSavedPlayers] = useState<FormData[]>([]);
  const [resultData, setResultData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('savedPitchers');
    if (saved) setSavedPlayers(JSON.parse(saved));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      let newPainList = [...formData.painList];
      
      if (value === 'none') {
        newPainList = checked ? ['none'] : [];
      } else {
        newPainList = newPainList.filter(p => p !== 'none');
        if (checked) newPainList.push(value);
        else newPainList = newPainList.filter(p => p !== value);
      }
      setFormData({ ...formData, painList: newPainList });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleChipSelect = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const goToStep2 = () => {
    if (!formData.name || !formData.age) {
      alert("선수의 이름과 나이를 입력해주세요.");
      return;
    }
    if (formData.season === 'inseason' && !formData.gameDate) {
      alert("시즌 중을 선택하셨습니다. 달력에서 시합(등판) 날짜를 선택해주세요.");
      return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const generateRoutine = (weekNum = 1) => {
    const age = parseInt(formData.age) || 0;
    const exp = parseInt(formData.exp) || 0;
    const isRehabPhase = formData.painList.length > 0 && !formData.painList.includes('none') && formData.recovery < 50;
    const isReturnPhase = formData.painList.length > 0 && !formData.painList.includes('none') && formData.recovery >= 50 && formData.recovery < 80;

    let analysisStr = `학생선수 연령(${age}세) 및 구력(${exp}년차) 맞춤 분석\n\n`;
    
    if (exp < 2) {
      analysisStr += `[기본기 우선] 야구 구력이 2년 미만으로 짧습니다. 근력이 아무리 좋아도 부상 방지와 투구 밸런스 확립이 가장 중요하므로, 무리한 파워 훈련보다는 안정성 위주로 세팅했습니다.\n\n`;
    }

    let rehabHtml = null;
    if (formData.painList.length > 0 && !formData.painList.includes('none')) {
      rehabHtml = {
        date: formData.injuryDate,
        recovery: formData.recovery,
        phase: isRehabPhase ? "[적극적 재활 단계] 고중량 웨이트를 전면 중단하고, 통증이 없는 범위 내에서의 등척성(버티기) 훈련 및 재활 밴드로 훈련을 강제 변경했습니다." :
               isReturnPhase ? "[복귀(RTP) 준비 단계] 운동은 가능하지만 중량을 평소의 50~60%로 제한하고, 고반복(12~15회)을 통해 관절의 안정성을 확보하세요." :
               "[정상 훈련 단계] 회복률 80% 이상으로 정상 훈련 궤도에 올랐습니다. 단, 웜업을 평소보다 철저히 하세요."
      };
    }

    let ageTag = { text: '', color: '' };
    if (age <= 12) { ageTag = { text: '🌱 초등부 (U-12)', color: 'bg-emerald-500' }; analysisStr += `성장판 보호를 위해 무거운 바벨을 금지하고 맨몸 통제력 중심으로 세팅되었습니다.`; }
    else if (age <= 15) { ageTag = { text: '🚀 중등부 (U-15)', color: 'bg-amber-500' }; analysisStr += `웨이트 기본 자세(패턴)를 완벽 숙지하는 것에 목적을 둡니다.`; }
    else if (age <= 18) { ageTag = { text: '🔥 고등부 (U-18)', color: 'bg-red-500' }; analysisStr += `웨이트는 필수입니다. 부상 회복만 완료되었다면 적극적인 스트렝스 향상을 노리세요.`; }
    else { ageTag = { text: '⚡ 대학/성인', color: 'bg-purple-500' }; analysisStr += `최대 파워 및 폭발력 변환(플라이오메트릭)에 집중합니다.`; }

    // 볼륨 설정
    let volLegs = "", volPush = "", volPull = "", volPower = "", volSprint = "";
    if (isRehabPhase) {
      volLegs = "3세트 x 15~20회 (맨몸/재활, 통증 제어)"; volPush = "3세트 x 20초 버티기 (등척성 수축)"; volPull = "3세트 x 15회 (가벼운 저항 밴드)"; volPower = "재활 단계이므로 파워 훈련 강제 생략"; volSprint = "스프린트 금지 (고정식 자전거 10분 대체)";
    } else if (isReturnPhase || age <= 12 || exp < 2) {
      volLegs = "3세트 x 12~15회 (자세 통제력 유지)"; volPush = "3세트 x 12회 (완벽한 자세 집중)"; volPull = "3세트 x 10~12회 (상체 감속근 활성화)"; volPower = "3세트 x 8회 (관절 충격 없는 가벼운 움직임)"; volSprint = "3세트 x 15m (70~80% 강도로 폼 위주)";
    } else {
      if (formData.season === 'offseason') {
        volLegs = "5세트 x 5회 (80~85% 1RM)"; volPush = "4세트 x 8회 (70~75% 1RM)"; volPull = "5세트 x 6~8회 (중량 추가, 강한 감속력)"; volPower = "4세트 x 5회 (최대 폭발력)"; volSprint = "5세트 x 30m (100% 전력 질주)";
      } else {
        volLegs = "3세트 x 4~5회 (70~75% 1RM, 유지 보수)"; volPush = "3세트 x 6회 (피로도 최소화)"; volPull = "3세트 x 6~8회 (감속근 유지)"; volPower = "3세트 x 5회 (신경계 활성화)"; volSprint = "3세트 x 20m (가볍게 런닝 위주)";
      }
    }

    // 종목 매핑
    let exLegsBase, exPush, exPull, exPower, exSprint;
    if (age <= 12) {
      exLegsBase = "맨몸 고블릿 스쿼트 및 워킹 런지"; exPush = "무릎 대고 푸시업/튜빙밴드 프레스"; exPull = "인버티드 로우 (철봉 당기기)"; exPower = "제자리 멀리뛰기 (양발)"; exSprint = "단거리 질주 15m";
    } else if (age <= 15) {
      exLegsBase = "빈바(Empty Bar) 스쿼트"; exPush = "푸시업/가벼운 덤벨 프레스"; exPull = "어시스트 풀업"; exPower = "가벼운 케틀벨 스윙"; exSprint = "단거리 질주 20m";
    } else {
      exLegsBase = formData.dl >= 4 ? "바벨 백 스쿼트" : "박스 스쿼트"; exPush = "덤벨 벤치 프레스"; exPull = "중량 풀업 및 바벨 로우"; exPower = "박스 점프 + 메디신볼 파워 스로우"; exSprint = "전력 스프린트 30m";
    }

    if (isRehabPhase || isReturnPhase) {
      if (formData.painList.includes('ankle') || formData.painList.includes('knee')) { exPower = "코어 밸런스 보드 훈련 (점프 금지)"; exSprint = "실내 고정식 자전거"; }
      if (formData.painList.includes('shoulder')) exPush = "회전근개 튜빙 밴드 외회전(ER) 재활";
      if (formData.painList.includes('back')) exLegsBase = "맨몸 힙 브릿지 (허리 부담 제로)";
    }

    let exMob = "필수 가동성 집중 스트레칭 15분 (부상 방지)";
    let days = [];

    if (formData.season === 'offseason') {
      days = [
        { title: "월요일 (하체/코어 스트렝스)", dday: "", list: [{n: exMob, v: ''}, {n: `메인 하체: ${exLegsBase}`, v: volLegs}, {n: `파워 훈련: ${exPower}`, v: volPower}] },
        { title: "화요일 (리커버리 및 밸런스)", dday: "", list: [{n: "전신 폼롤링 20분", v: ''}, {n: "거울 보고 섀도우 피칭 (자세 점검)", v: ''}] },
        { title: "수요일 (상체 및 감속근 보강)", dday: "", list: [{n: exMob, v: ''}, {n: `미는 힘: ${exPush}`, v: volPush}, {n: `당기는 힘: ${exPull}`, v: volPull}] },
        { title: "목요일 (적극적 휴식)", dday: "", list: [{n: "가벼운 조깅 20분", v: ''}, {n: "수건 피칭 릴리스 포인트 점검", v: ''}] },
        { title: "금요일 (스피드 및 하체 유지)", dday: "", list: [{n: exMob, v: ''}, {n: `스피드/민첩성: ${exSprint}`, v: volSprint}, {n: `하체 보조: ${exLegsBase}`, v: "3세트 x 8~10회 (가볍게 폼 위주)"}] },
        { title: "토요일 (불펜 피칭)", dday: "", list: [{n: "투구 수 제한 불펜 피칭 (구속보단 밸런스 유지)", v: ''}] },
        { title: "일요일 (완전 휴식)", dday: "", list: [{n: "어깨/팔꿈치 아이싱 및 완전 휴식", v: ''}] }
      ];
    } else {
      const gameDayOfWeek = new Date(formData.gameDate).getDay();
      const template = {
        0: { tag: "D-Day", role: "실전 등판", list: [{n: "등판 30분 전 튜빙/동적 스트레칭 철저 웜업", v: ''}, {n: "경기 후 즉시 어깨/팔꿈치 아이싱", v: ''}] },
        1: { tag: "D-1", role: "신경계 활성화", list: [{n: `스피드 활성화: ${exSprint}`, v: volSprint}, {n: "단기 폼롤링 및 코어 활성화 (데드버그)", v: ''}] },
        2: { tag: "D-2", role: "메커니즘 점검", list: [{n: "피칭 전면 휴식 및 섀도우 피칭 점검", v: ''}, {n: "어깨 회전근개 가벼운 밴드 보강", v: ''}] },
        3: { tag: "D-3", role: "완전 휴식", list: [{n: "웨이트 및 피칭 전면 휴식", v: ''}, {n: "전력 분석 및 멘탈 트레이닝", v: ''}] },
        4: { tag: "D-4", role: "상체 및 불펜", list: [{n: `상체 감속근 유지: ${exPull}`, v: volPull}, {n: "가벼운 불펜 피칭 (영점 조절)", v: ''}] },
        5: { tag: "D+2", role: "하체 웨이트", list: [{n: exMob, v: ''}, {n: `메인 하체: ${exLegsBase}`, v: volLegs}, {n: `파워 유지: ${exPower}`, v: volPower}] },
        6: { tag: "D+1", role: "회복 (Recovery)", list: [{n: "가벼운 러닝 20분 (젖산 분해)", v: ''}, {n: "전신 폼롤링 및 흉추/고관절 가동성 스트레칭", v: ''}] }
      };
      const weekNames = ["일", "월", "화", "수", "목", "금", "토"];
      const displayOrder = [1, 2, 3, 4, 5, 6, 0]; 
      
      displayOrder.forEach(currentDay => {
        let daysUntilGame = (gameDayOfWeek - currentDay + 7) % 7; 
        let info = template[daysUntilGame as keyof typeof template];
        days.push({ title: `${weekNames[currentDay]}요일 (${info.role})`, dday: info.tag, list: info.list });
      });
    }

    const finalData = { ...formData, week: weekNum, id: formData.id || Date.now() };
    setFormData(finalData);
    setResultData({ analysisStr, rehabHtml, ageTag, days });
    setStep(3);
    window.scrollTo(0, 0);
  };

  const saveRoutine = (isUpgrade = false) => {
    let newSaved = [...savedPlayers];
    const existingIdx = newSaved.findIndex(p => p.id === formData.id);
    if (existingIdx >= 0) newSaved[existingIdx] = formData;
    else newSaved.push(formData);
    
    setSavedPlayers(newSaved);
    localStorage.setItem('savedPitchers', JSON.stringify(newSaved));
    if (!isUpgrade) alert("✅ 안전하게 기기에 저장되었습니다.");
  };

  const upgradeWeek = () => {
    const nextWeek = (formData.week || 1) + 1;
    setFormData({ ...formData, week: nextWeek });
    generateRoutine(nextWeek);
    saveRoutine(true);
    alert(`🎉 ${nextWeek}주차 레벨업! 선수 성장에 맞춰 스케줄을 유지하세요.`);
  };

  const deletePlayer = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("정말 이 데이터를 영구 삭제하시겠습니까?")) {
      const newSaved = savedPlayers.filter(p => p.id !== id);
      setSavedPlayers(newSaved);
      localStorage.setItem('savedPitchers', JSON.stringify(newSaved));
    }
  };

  const loadPlayer = (player: FormData) => {
    setFormData(player);
    generateRoutine(player.week || 1);
  };

  const ageGroup = getAgeGroup(parseInt(formData.age) || 0);
  const assessmentOpts = getAssessmentOptions(ageGroup);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">
      <div className="max-w-2xl mx-auto p-5">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 mt-4">
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Activity className="text-blue-500" />
            Pitcher Lab S&C
          </h1>
          <p className="text-gray-500 text-sm mt-1">초중고대 과학적 훈련 시스템</p>
        </motion.div>

        {/* Step Indicator */}
        {step < 3 && (
          <div className="flex gap-2 mb-6">
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              
              <div className="bg-white p-6 rounded-3xl shadow-sm mb-5 border border-gray-100">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><User size={20} className="text-blue-500"/> 기본 정보 및 구력</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold mb-1.5 text-gray-700">이름</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="예: 홍길동" className="w-full p-3.5 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5 text-gray-700">나이</label>
                    <input type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="예: 18" className="w-full p-3.5 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1.5 text-gray-700">구력(년)</label>
                    <input type="number" name="exp" value={formData.exp} onChange={handleInputChange} placeholder="5" className="w-full p-3.5 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5 text-gray-700">키(cm)</label>
                    <input type="number" name="height" value={formData.height} onChange={handleInputChange} placeholder="180" className="w-full p-3.5 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5 text-gray-700">체중(kg)</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} placeholder="80" className="w-full p-3.5 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm mb-5 border border-gray-100">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Calendar size={20} className="text-blue-500"/> 시즌 주기화 및 훈련 시간</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['offseason', 'inseason'].map((s) => (
                    <button key={s} onClick={() => handleChipSelect('season', s)} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${formData.season === s ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-50 text-gray-500 border border-transparent'}`}>
                      {s === 'offseason' ? '비시즌 (동계/벌크업)' : '시즌 중 (리그/대회)'}
                    </button>
                  ))}
                </div>

                {formData.season === 'inseason' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-50 p-4 rounded-2xl border border-red-100 mb-5">
                    <label className="block text-sm font-bold text-red-600 mb-2">🎯 등판/시합 예정일</label>
                    <p className="text-xs text-red-500 mb-3 font-medium">시합 요일을 선택하면 스케줄이 역산되어 자동 배치됩니다.</p>
                    <input type="date" name="gameDate" value={formData.gameDate} onChange={handleInputChange} className="w-full p-3.5 bg-white rounded-xl focus:ring-2 focus:ring-red-400 focus:outline-none font-medium" />
                  </motion.div>
                )}

                <label className="block text-sm font-bold mb-2 text-gray-700 mt-2">⏱️ 훈련 가능 시간</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { v: 'short', l: '30~40분 (압축)' },
                    { v: 'medium', l: '1시간 반 (표준)' },
                    { v: 'long', l: '2시간 이상 (풀타임)' }
                  ].map((t) => (
                    <button key={t.v} onClick={() => handleChipSelect('trainTime', t.v)} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${formData.trainTime === t.v ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-50 text-gray-500 border border-transparent'}`}>
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 border border-gray-100">
                <h2 className="text-lg font-bold mb-2 flex items-center gap-2"><AlertCircle size={20} className="text-red-500"/> 부상 이력 및 재활 (RTP)</h2>
                <p className="text-xs text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg">현재 통증이 있거나 재활 중인 부위를 모두 선택하세요.</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { v: 'shoulder', l: '어깨' }, { v: 'elbow', l: '팔꿈치' },
                    { v: 'back', l: '허리' }, { v: 'knee', l: '무릎' },
                    { v: 'ankle', l: '발목' }, { v: 'none', l: '아프지 않아요' }
                  ].map((p) => (
                    <label key={p.v} className={`px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all border ${formData.painList.includes(p.v) ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-500 border-transparent'}`}>
                      <input type="checkbox" name="painList" value={p.v} checked={formData.painList.includes(p.v)} onChange={handleInputChange} className="hidden" />
                      {p.l}
                    </label>
                  ))}
                </div>

                {formData.painList.length > 0 && !formData.painList.includes('none') && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 pt-5 border-t border-dashed border-gray-200">
                    <div className="mb-4">
                      <label className="block text-sm font-bold mb-1.5 text-gray-700">🩹 부상 발생일</label>
                      <input type="date" name="injuryDate" value={formData.injuryDate} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1 text-gray-700">🔋 현재 회복 진행률: <span className="text-blue-600 text-lg">{formData.recovery}%</span></label>
                      <p className="text-xs text-gray-400 mb-3">0% = 방금 다침, 50% = 일상생활 가능, 100% = 완전 회복</p>
                      <input type="range" name="recovery" min="0" max="100" value={formData.recovery} onChange={handleInputChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                    </div>
                  </motion.div>
                )}
              </div>

              <button onClick={goToStep2} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 text-lg">
                신체 정밀 평가로 넘어가기 <ChevronRight size={20} />
              </button>

              {savedPlayers.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-sm font-bold text-gray-400 mb-4 px-2">내 저장된 데이터 관리</h3>
                  <div className="flex flex-col gap-3">
                    {savedPlayers.map(p => (
                      <div key={p.id} onClick={() => loadPlayer(p)} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-xl">⚾</div>
                          <div>
                            <div className="font-bold text-gray-900">{p.name} <span className="text-xs font-normal text-gray-500">({p.age}세)</span></div>
                            <div className="text-xs font-semibold text-gray-500 mt-0.5">{p.week || 1}주차 · {p.season === 'inseason' ? '🔥 시즌' : '❄️ 비시즌'}</div>
                          </div>
                        </div>
                        <button onClick={(e) => deletePlayer(p.id!, e)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 border border-gray-100">
                <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                  📊 <span className="text-blue-600">{assessmentOpts.title}</span> 기준 적용
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">🏃 100M 스프린트 (하체 폭발력)</label>
                    <select name="sprint" value={formData.sprint} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-sm">
                      {assessmentOpts.sprint.map(o => <option key={o.v} value={o.v}>{o.t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1 text-gray-700">{assessmentOpts.dlLabel}</label>
                    <p className="text-xs text-gray-500 mb-2 bg-gray-50 p-2 rounded-lg">{assessmentOpts.dlHelper}</p>
                    <select name="dl" value={formData.dl} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-sm">
                      {assessmentOpts.dl.map(o => <option key={o.v} value={o.v}>{o.t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">{assessmentOpts.backLabel}</label>
                    <select name="back" value={formData.back} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-sm">
                      {assessmentOpts.back.map(o => <option key={o.v} value={o.v}>{o.t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1 text-gray-700">🔄 어깨 유연성 (월 엔젤 테스트)</label>
                    <p className="text-xs text-gray-500 mb-2 bg-gray-50 p-2 rounded-lg">💡 벽에 등과 뒤통수를 대고 양팔 '만세'. 흉추 가동성과 외회전 각도를 측정합니다.</p>
                    <select name="shoulder" value={formData.shoulder} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-sm">
                      <option value="1">1단계: 손등이 벽에서 15cm 이상 떨어짐 (가동성 심각)</option>
                      <option value="2">2단계: 억지로 벽에 닿지만 허리가 뜸 (다소 뻣뻣)</option>
                      <option value="3">3단계: 약간 뻐근하지만 자세 유지 가능 (정상 각도)</option>
                      <option value="4">4단계: 허리가 완벽히 붙은 상태로 부드럽게 닿음 (유연함)</option>
                      <option value="5">5단계: 벽에 손등을 붙인 채 슬라이딩 완벽 가능 (매우 유연)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1 text-gray-700">🧘 고관절 90/90 유연성</label>
                    <p className="text-xs text-gray-500 mb-2 bg-gray-50 p-2 rounded-lg">💡 바닥에 앉아 양 무릎을 90도로 구부린 자세. 투구 스트라이드를 결정합니다.</p>
                    <select name="hip" value={formData.hip} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-sm">
                      <option value="1">1단계: 상체를 세우지 못하고 뒤로 넘어감</option>
                      <option value="2">2단계: 손을 바닥에 강하게 짚어야만 간신히 유지</option>
                      <option value="3">3단계: 손을 떼고 허리를 세운 채 10초 버티기 가능</option>
                      <option value="4">4단계: 자세를 유지하며 상체를 앞/옆으로 숙여 회전 가능</option>
                      <option value="5">5단계: 손 안 짚고 양쪽 무릎 좌우 스위치 완벽 수행</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={() => generateRoutine(1)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 text-lg">
                  <CheckCircle2 size={20} /> 정밀 분석 완료 및 스케줄 생성
                </button>
                <button onClick={() => setStep(1)} className="w-full bg-white hover:bg-gray-50 text-gray-600 font-bold py-4 rounded-2xl border border-gray-200 transition-all flex items-center justify-center gap-2">
                  <ChevronLeft size={20} /> 이전 단계로 수정
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: RESULT */}
          {step === 3 && resultData && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 border border-gray-100">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-extrabold text-gray-900">{formData.name} 선수</h2>
                      <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-lg">{formData.week || 1}주차</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      {formData.age}세 · 구력 {formData.exp}년 {formData.height && `· ${formData.height}cm`} {formData.weight && `· ${formData.weight}kg`}
                    </p>
                    <p className="text-sm font-bold text-blue-600 mt-2">
                      {formData.season === 'inseason' ? `🔥 시즌 중 D-Day 등판일: ${new Date(formData.gameDate).toLocaleDateString()}` : '❄️ 비시즌 (동계 체력단련/벌크업 모드)'}
                    </p>
                  </div>
                  <div className="text-4xl">🧢</div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
                  <h3 className="text-sm font-bold text-blue-600 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
                    <TrendingUp size={16} /> 맞춤형 스포츠 과학 리포트
                  </h3>
                  
                  {resultData.rehabHtml && (
                    <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500 mb-4">
                      <strong className="text-red-600 flex items-center gap-1.5 mb-2"><ShieldAlert size={16}/> 의학적 재활(RTP) 프로토콜 발동</strong>
                      <ul className="text-sm text-gray-700 space-y-1 mb-2">
                        {resultData.rehabHtml.date && <li>- 부상 일자: {resultData.rehabHtml.date}</li>}
                        <li>- 현재 회복률: {resultData.rehabHtml.recovery}%</li>
                      </ul>
                      <p className="text-sm font-bold text-gray-800">{resultData.rehabHtml.phase}</p>
                    </div>
                  )}

                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    <span className={`inline-block px-2 py-0.5 rounded text-white font-bold text-xs mb-2 ${resultData.ageTag.color}`}>{resultData.ageTag.text}</span><br/>
                    {resultData.analysisStr}
                  </div>
                </div>

                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Calendar size={20} className="text-blue-500"/> 주간 맞춤 스케줄</h2>
                <div className="space-y-4">
                  {resultData.days.map((d: any, i: number) => (
                    <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        {d.dday && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded uppercase">{d.dday}</span>}
                        {d.title}
                      </div>
                      <ul className="space-y-2">
                        {d.list.map((item: any, j: number) => (
                          <li key={j} className="bg-gray-50 p-3.5 rounded-xl border-l-4 border-blue-500 text-sm text-gray-700 font-medium">
                            {item.n}
                            {item.v && <div className="inline-block mt-1.5 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md ml-2">{item.v}</div>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={() => saveRoutine(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 text-lg">
                  <Save size={20} /> 이 스케줄 기기에 안전하게 저장
                </button>
                <button onClick={upgradeWeek} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-lg">
                  다음 주차로 레벨업 (강도 UP) <TrendingUp size={20} />
                </button>
                <button onClick={() => { setStep(1); setFormData(initialFormData); }} className="w-full bg-white hover:bg-gray-50 text-gray-600 font-bold py-4 rounded-2xl border border-gray-200 transition-all flex items-center justify-center gap-2">
                  처음부터 다시 만들기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

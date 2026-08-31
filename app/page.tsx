'use client';
import { useMemo, useState } from 'react';
import { Search, Bookmark, Heart, MessageCircle, Eye, ArrowUpRight, ChevronRight, X, TrendingUp } from 'lucide-react';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';

const categories = ['전체', '창업', '마케팅', '브랜딩', '커리어', '재테크', '생산성', 'AI·테크'];
const posts = [
  { id:1, category:'창업', title:'매출이 아니라 재구매율을 보기 시작하자 사업이 달라졌다', excerpt:'첫 구매를 만드는 것보다 두 번째 구매를 설계하는 일이 훨씬 중요했습니다. 고객 인터뷰 30번 끝에 찾은 세 가지 전환점을 공유합니다.', author:'김서준', role:'커머스 브랜드 대표', initials:'김', time:'2시간 전', likes:128, comments:24, views:'2.1k', featured:true, color:'#3d2917' },
  { id:2, category:'마케팅', title:'광고비 0원으로 첫 고객 100명을 모은 방법', excerpt:'채널을 늘리기 전에 고객이 이미 모여 있는 한 곳을 깊게 파고들었습니다.', author:'이하은', role:'그로스 마케터', initials:'이', time:'4시간 전', likes:86, comments:17, views:'1.4k', color:'#33301f' },
  { id:3, category:'AI·테크', title:'팀의 반복 업무 40%를 줄인 AI 자동화 설계도', excerpt:'도구보다 먼저 정리해야 할 업무 흐름과 실패했던 자동화 사례까지 공개합니다.', author:'박도윤', role:'AI 프로덕트 빌더', initials:'박', time:'어제', likes:203, comments:31, views:'3.8k', color:'#2b2a27' },
  { id:4, category:'브랜딩', title:'작은 브랜드가 가격 경쟁에서 빠져나오는 법', excerpt:'예쁜 로고보다 고객이 우리를 기억할 한 문장이 먼저였습니다.', author:'최유진', role:'브랜드 디렉터', initials:'최', time:'어제', likes:74, comments:12, views:'980', color:'#40291a' },
  { id:5, category:'커리어', title:'퇴사 전 90일, 독립을 준비하며 만든 체크리스트', excerpt:'막연한 자신감 대신 현금흐름과 고객 파이프라인을 숫자로 점검했습니다.', author:'오민재', role:'1인 기업 운영자', initials:'오', time:'2일 전', likes:156, comments:28, views:'2.7k', color:'#35301f' },
];
const people = [
  {name:'정지우', role:'SaaS 창업가', init:'정', color:'#4a4540'}, {name:'한소연', role:'콘텐츠 전략가', init:'한', color:'#ff6b2c'}, {name:'윤태호', role:'VC 심사역', init:'윤', color:'#8a5a3b'}
];

export default function Home() {
  const [category, setCategory] = useState('전체'); const [query, setQuery] = useState(''); const [liked, setLiked] = useState<number[]>([]); const [saved, setSaved] = useState<number[]>([]); const [write, setWrite] = useState(false);
  const filtered = useMemo(() => posts.filter(p => (category==='전체'||p.category===category) && (p.title+p.excerpt+p.author).includes(query)), [category, query]);
  const toggle = (id:number, list:number[], set:(v:number[])=>void) => set(list.includes(id)?list.filter(x=>x!==id):[...list,id]);
  return <>
    <SiteHeader active="insight" onWrite={()=>setWrite(true)} />
    <main>
      <section className="hero"><div className="wrap heroInner"><div><span className="eyebrow">먼저 가본 사람들의 진짜 경험</span><h1>성공은 혼자보다<br/><em>함께일 때 빨라집니다.</em></h1><p>사업과 커리어의 다음 단계를 고민하는 사람들이<br/>실패와 배움을 솔직하게 나누는 성장 커뮤니티.</p><div className="heroBtns"><button onClick={()=>setWrite(true)}>내 경험 나누기 <ArrowUpRight size={18}/></button><a href="#feed">인사이트 둘러보기 <ChevronRight size={18}/></a></div></div><div className="heroCard"><div className="quote">“</div><p>정답보다 먼저 해본 사람의<br/><b>구체적인 경험</b>이 필요할 때</p><div className="miniStats"><span><b>12.8K</b> 성장하는 멤버</span><span><b>3.4K</b> 검증된 인사이트</span></div><div className="float f1">#첫고객</div><div className="float f2">#브랜딩</div><div className="float f3">#자동화</div></div></div></section>
      <section className="trend wrap"><span><TrendingUp size={17}/> 지금 뜨는 이야기</span><div><a># AI로 혼자 일하는 법</a><a># 재구매를 만드는 CX</a><a># 1인 기업 생존기</a></div><span className="today">오늘 1,284명 읽음</span></section>
      <div className="content wrap" id="feed"><section className="feed"><div className="sectionHead"><div><small>매일 업데이트</small><h2>오늘의 인사이트</h2></div><div className="search"><Search size={18}/><input placeholder="관심 있는 주제를 검색하세요" value={query} onChange={e=>setQuery(e.target.value)}/></div></div><div className="cats">{categories.map(c=><button key={c} className={c===category?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="postList">{filtered.map((p,i)=><article className={i===0?'featured':''} key={p.id}><div className="postBody"><span className="tag">{p.category}</span><h3>{p.title}</h3><p>{p.excerpt}</p><div className="author"><span className="avatar" style={{background:p.color}}>{p.initials}</span><div><b>{p.author}</b><small>{p.role} · {p.time}</small></div></div><div className="metrics"><button className={liked.includes(p.id)?'on':''} onClick={()=>toggle(p.id,liked,setLiked)}><Heart size={17} fill={liked.includes(p.id)?'currentColor':'none'}/> {p.likes+(liked.includes(p.id)?1:0)}</button><span><MessageCircle size={17}/> {p.comments}</span><span><Eye size={17}/> {p.views}</span><button className={'save '+(saved.includes(p.id)?'on':'')} onClick={()=>toggle(p.id,saved,setSaved)}><Bookmark size={18} fill={saved.includes(p.id)?'currentColor':'none'}/></button></div></div><div className="thumb" style={{background:p.color}}><span>{p.category}</span><i>성공<br/>인사이드</i></div></article>)}{!filtered.length&&<div className="empty">검색 결과가 없습니다.</div>}</div><button className="more">인사이트 더 보기 <ChevronRight size={17}/></button></section>
        <aside><div className="sideCard ranking"><div className="sideTitle"><h3>이번 주 인기 글</h3><span>주간</span></div>{posts.slice(0,4).map((p,i)=><a key={p.id}><strong>0{i+1}</strong><div><b>{p.title}</b><small>{p.author} · 조회 {p.views}</small></div></a>)}</div><div className="sideCard members"><div className="sideTitle"><h3>주목할 멤버</h3><a>전체보기</a></div>{people.map(p=><div className="person" key={p.name}><span style={{background:p.color}}>{p.init}</span><div><b>{p.name}</b><small>{p.role}</small></div><button>팔로우</button></div>)}</div><div className="newsletter"><span>뉴스레터</span><h3>한 주의 좋은 인사이트를<br/>메일로 받아보세요.</h3><p>매주 수요일, 8,400명이 함께 읽습니다.</p><div><input placeholder="이메일 주소"/><button>구독</button></div></div></aside></div>
    </main><SiteFooter />
    {write&&<div className="modal" onMouseDown={()=>setWrite(false)}><div onMouseDown={e=>e.stopPropagation()}><button className="close" onClick={()=>setWrite(false)}><X/></button><span className="eyebrow">경험 나누기</span><h2>어떤 경험을 나눌까요?</h2><input placeholder="제목을 입력하세요"/><select><option>카테고리를 선택하세요</option>{categories.slice(1).map(c=><option key={c}>{c}</option>)}</select><textarea placeholder="성공뿐 아니라 과정의 시행착오도 좋은 인사이트가 됩니다."/><div className="modalActions"><button onClick={()=>setWrite(false)}>취소</button><button onClick={()=>setWrite(false)}>임시 저장</button></div></div></div>}
  </>;
}

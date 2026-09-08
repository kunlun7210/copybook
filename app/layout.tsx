import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'我的字帖 · 英语单词描写练习',description:'个人英语单词字帖，专用英文字体、四线格、分页与打印。'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="zh-CN"><body>{children}</body></html>}

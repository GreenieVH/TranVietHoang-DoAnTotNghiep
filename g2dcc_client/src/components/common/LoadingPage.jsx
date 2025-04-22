// components/common/LoadingPage.jsx
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

export default function LoadingPage({ fullScreen = false }) {
  return (
    <div className={`flex h-screen items-center justify-center ${fullScreen ? 'h-screen' : 'h-full'}`}>
      <Spin indicator={antIcon} tip="Đang tải..." size="large" />
    </div>
  );
}
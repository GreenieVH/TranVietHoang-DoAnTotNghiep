import { Button, Typography, Space } from 'antd';
import { FacebookOutlined, YoutubeOutlined, MessageOutlined } from '@ant-design/icons';
import React from 'react';

const { Text, Title } = Typography;

function UserFooter() {
  return (
    <div className="bg-ghead !text-thead text-center pt-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left px-4">
          <div>
            <Title level={4} className="!text-thead mb-4">Về chúng tôi</Title>
            <Text className="!text-thead">
              Cửa hàng xe điện uy tín, chất lượng hàng đầu Việt Nam
            </Text>
          </div>

          <div>
            <Title level={4} className="!text-thead mb-4">Liên hệ</Title>
            <Text className="!text-thead block">
              Email: <a href="mailto:tranhoangth1979@gmail.com">tranhoangth1979@gmail.com</a>
            </Text>
            <Text className="!text-thead">
              Điện thoại: <a href="tel:+0123456789">0123 456 789</a>
            </Text>
          </div>

          <div>
            <Title level={4} className="!text-thead mb-4">Hỗ trợ</Title>
            <Text className="!text-thead block">
              <a href="/huong-dan-mua-hang">Hướng dẫn mua hàng</a>
            </Text>
            <Text className="!text-thead block">
              <a href="/chinh-sach-bao-hanh">Chính sách bảo hành</a>
            </Text>
            <Text className="!text-thead block">
              <a href="/chinh-sach-doi-tra">Chính sách đổi trả</a>
            </Text>
          </div>

          <div>
            <Title level={4} className="!text-thead mb-4">Kết nối với chúng tôi</Title>
            <Space size="middle">
              <Button
                shape="circle"
                icon={<FacebookOutlined />}
                href="https://facebook.com"
                target="_blank"
                type="primary"
              />
              <Button
                shape="circle"
                icon={<YoutubeOutlined />}
                href="https://youtube.com"
                target="_blank"
                type="primary"
              />
              <Button
                shape="circle"
                icon={<MessageOutlined />}
                href="https://zalo.me"
                target="_blank"
                type="primary"
              />
            </Space>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-700">
          <Text className="!text-thead">© 2023 VietHoang Store. All rights reserved.</Text>
        </div>
      </div>
    </div>
  );
}

export default UserFooter;
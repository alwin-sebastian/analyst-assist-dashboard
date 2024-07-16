import React from 'react';
import { Tabs } from 'antd';
import PackageRoutes from '../routes/packageRoutes';
import UserFileRoutes from '../routes/userFileRoutes';
import { useNavigate, useLocation } from 'react-router-dom';

const items = [
    {
        key: '1',
        tab: 'Templates',
        content: <PackageRoutes />,
    },
    {
        key: '2',
        tab: 'Clients',
        content: <UserFileRoutes />,
    },
    ];

   
    

const { TabPane } = Tabs;

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const activeKey = location.pathname.includes('packages') ? '1' : '2';

    const handleTabChange = (key) => {
        if (key === '1') {
            console.log('clicked packages');
            navigate('templates');

        }
        if (key === '2') {
            console.log('clicked userfiles');
            navigate('clients');
        }
        // Add other tab navigation if needed
    };
    return (
        <div className="p-4">
        <Tabs defaultActiveKey="1" onChange={handleTabChange} onClick={handleTabChange}>
            {items.map(item => (
                <TabPane tab={item.tab} key={item.key} className='bg-gray-200 h-screen'>
                    {item.content}
                </TabPane>
            ))}
        </Tabs>
        </div>
    );
};

export default Dashboard;

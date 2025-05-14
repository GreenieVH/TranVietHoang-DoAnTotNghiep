import React from 'react';
import { Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../../../hooks/useCategorys';

const { SubMenu } = Menu;

const buildCategoryTree = (categories) => {
    const categoryMap = {};
    const tree = [];

    // Tạo bản đồ id -> category
    categories.forEach(cat => {
        categoryMap[cat.id] = { ...cat, children: [] };
    });

    // Gắn children vào parent
    categories.forEach(cat => {
        if (cat.parent_id) {
            if (categoryMap[cat.parent_id]) {
                categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
            }
        } else {
            tree.push(categoryMap[cat.id]);
        }
    });

    return tree;
};

const CategoryMenu = () => {
    const { categories } = useCategories();
    const navigate = useNavigate();

    const handleCategoryClick = (category) => {
        navigate('/products', {
            state: {
                filterParams: {
                    category_id: category.id,
                    category_name: category.name
                }
            }
        });
    };

    const categoryTree = buildCategoryTree(categories || []);

    const renderMenuItems = (items) =>
        items.map(item =>
            item.children.length > 0 ? (
                <SubMenu key={item.id} title={item.name} className='font-semibold'>
                    {renderMenuItems(item.children)}
                </SubMenu>
            ) : (
                <Menu.Item key={item.id} onClick={() => handleCategoryClick(item)} className='font-semibold'>
                    {item.name}
                </Menu.Item>
            )
        );

    return (
        <Menu mode="horizontal" triggerSubMenuAction="hover" className='w-full flex justify-center'>
            {renderMenuItems(categoryTree)}
        </Menu>
    );
};

export default CategoryMenu;

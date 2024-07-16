import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Input, Button, Table, Tag, message, Spin, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined, SearchOutlined  } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const colors = [
  "magenta",
  "purple",
  "green",
  "yellow",
  "volcano",
  "orange",
  "gold",
  "lime",
  "cyan",
  "blue",
  "geekblue",
];

const colorMap = {};

// Function to get a random color
const getColor = (type) => {
  if (!colorMap[type]) {
    colorMap[type] = colors[Object.keys(colorMap).length % colors.length];
  }
  return colorMap[type];
};

export default function PackageList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState([]);
  const navigate = useNavigate();

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://b20os9s2j7.execute-api.us-east-1.amazonaws.com/test/packages/get-packages');
      console.log("Packages:", response.data.packages);
      const packages = response.data.packages;
      setResponse(packages);

      const tableData = packages.map((pkg, index) => ({
        key: index,
        packageName: pkg.TemplateName,
        packageType: pkg.TemplateType,
        color: getColor(pkg.packageType),
      }));

      setData(tableData);
      setLoading(false);
    } catch (error) {
      console.error(error);
      message.error("Failed to load packages");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = async (packageName, packageId) => {
    try {
      await axios.delete(`https://b20os9s2j7.execute-api.us-east-1.amazonaws.com/test/packages/delete-package/${packageName}`, { data: { packageId } });  
      message.success(`Package ${packageName} deleted successfully`);
      fetchPackages(); 
    } catch (error) {
      console.error(error);
      message.error("Failed to delete package");
    }
  };


  const columns = [
    {
      title: "Template Name",
      dataIndex: "packageName",
      key: "packageName",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Search Package Name`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) => record.packageName.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Template Type",
      dataIndex: "packageType",
      key: "packageType",
      filters: Array.from(new Set(response.map(pkg => pkg.TemplateType))).map(type => ({ text: type, value: type })),
      onFilter: (value, record) => record.packageType === value,
      render: (text) => <Tag color={getColor(text)}>{text}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <div 
        // items inside div to justifty between and space between each item to 4
        className="flex justify-between w-1/4"
        >
          <Link to={`/dashboard/templates/${record.packageName}`}
            state={{ packageDetails: response.find(pkg => pkg.TemplateName === record.packageName) }}
            
          >View</Link>
          <Popconfirm
            title={`Are you sure you want to delete ${record.packageName}?`}
            onConfirm={() => handleDelete(record.packageName, response.find(pkg => pkg.TemplateName === record.packageName).TemplateId)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined className="ml-8 text-red-600 cursor-pointer" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Templates</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/dashboard/create-template")}
        >
          Create Template
        </Button>
      </div>

      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data} bordered className="p-4" />
      </Spin>
    </div>
  );
}

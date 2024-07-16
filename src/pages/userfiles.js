import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Table, Tag, message, Spin, Popconfirm, Input } from "antd";
import { PlusOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

  

export default function UserFiles() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  // const columns = [
  //   {
  //     title: "UserFile",
  //     dataIndex: "userFileName",
  //     key: "userFileName",
  //   },
  //   {
  //     title: "Package",
  //     dataIndex: "packageId",
  //     key: "packageName",
  //   },
  //   {
  //     title: "Action",
  //     key: "action",
  //     render: (text, record) => (
  //       <Link to={`/dashboard/userfiles/${record.userFileName}`}
  //         state= {{
  //             userDetails: data.userFiles.find(pkg => pkg.userFileName === record.userFileName)
  //           }}
  //     >View</Link>
  //     ),
  //   },
  // ];

  const fetchUserFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://b20os9s2j7.execute-api.us-east-1.amazonaws.com/test/userfiles/get-userfiles");
      setData(response.data); 
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user files:", error);
      message.error("Failed to load user files");
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchUserFiles();
  }, []);

  const handleDelete = async (userFileName, userId) => {
    try {
      await axios.delete(`https://b20os9s2j7.execute-api.us-east-1.amazonaws.com/test/userfiles/delete-userfile/${userFileName}`, {
      data: { userId },
    });
      message.success(`Client file ${userFileName} deleted successfully`);
      fetchUserFiles();
    } catch (error) {
      console.error("Error deleting client file:", error);
      message.error("Failed to delete client file");
    }
  };

  const columns = [
    {
      title: "Client Name",
      dataIndex: "ClientName",
      key: "userFileName",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Client Name"
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
      onFilter: (value, record) => record.UserName.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Template",
      dataIndex: "TemplateId",
      key: "packageId",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <div className="flex justify-between items-center space-x-4">
          <Link to={`/dashboard/clients/${record.UserName}`} state={{ userDetails: record }}>
            View
          </Link>
          <Popconfirm
            title={`Are you sure you want to delete ${record.UserName}?`}
            onConfirm={() => handleDelete(record.UserName, record.UserId)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined className="text-red-600 cursor-pointer" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Clients</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/dashboard/create-client")}
        >
          Create Client
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data?.userFiles || ""} bordered className="p-4" />
      </Spin>
    </div>
  );
}

import React, { useState, useRef, useContext, useEffect } from "react";
import "./App.css";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Button,
  Table,
  Input,
  Space,
  Form,
  Popconfirm,
  InputNumber,
} from "antd";

const { Header, Sider, Content } = Layout;

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  return (
    <EditableContext.Consumer>
      {(form) => (
        <Form form={form} component={false}>
          <tr {...props} />
        </Form>
      )}
    </EditableContext.Consumer>
  );
};

// 可编辑行
const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      // Focus the input upon editing
      inputNode.current?.focus();
    }
  }, [editing]);

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
          initialValue={record[dataIndex]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const App = () => {
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const colorBgContainer = "#fff"; // 用假设值代替
  const [editingKey, setEditingKey] = useState("");

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key) => {
    try {
      const values = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...values });
        setData(newData);
      }
      setEditingKey("");
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  const handleAdd = () => {
    const newData = {
      key: count,
      name: inputValue || `${count}`,
      time: new Date().toLocaleString(), // 这里添加当前时间
      age: 32,
      address: `London, Park Lane no. ${count}`,
    };
    setData([...data, newData]);
    setCount(count + 1);
    setInputValue(""); // 清空输入框
  };

  const handleSave = (row) => {
    const newData = [...data];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setData(newData);
    setEditingKey("");
  };

  const handleDelete = (key) => {
    setData(data.filter((item) => item.key !== key));
  };

  const columns = [
    {
      title: "内容",
      dataIndex: "name",
      key: "name",
      editable: true,
    },
    {
      title: "新增時間",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "操作",
      dataIndex: "operation",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <EditableContext.Consumer>
              {(form) => (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    save(record.key);
                  }}
                  style={{
                    marginRight: "8px",
                  }}
                >
                  Save
                </Button>
              )}
            </EditableContext.Consumer>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Space size="middle">
            <Button
              disabled={editingKey !== ""}
              onClick={() => edit(record)}
              icon={<EditOutlined />}
            >
              Edit
            </Button>
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record.key)}
            >
              <Button icon={<DeleteOutlined />}>Delete</Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  return (
    <EditableContext.Provider value={form}>
      <Layout style={{ minHeight: "100vh" }}>
        {" "}
        {/* 设置最小高度为视口高度 */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            height: "100vh",
            overflow: "auto",
          }}
        >
          <div className="demo-logo-vertical" />
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "28px",
              width: "70px",
              height: "50px",
              border: "5px",
              color: "#fff",
            }}
          />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["4"]}
            items={[
              {
                key: "1",
                icon: <UserOutlined />,
                label: "系統一",
              },
              {
                key: "2",
                icon: <VideoCameraOutlined />,
                label: "系統二",
              },
              {
                key: "3",
                icon: <UploadOutlined />,
                label: "系統三",
              },
            ]}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
              borderBottom: "1px solid #f0f0f0", // 添加底边线样式以匹配视觉效果
            }}
          >
            <Button
              type="text"
              icon={
                collapsed ? (
                  <img
                    src="QportCMS2.png"
                    alt="Unfold"
                    style={{ width: 163, height: 40 }}
                  />
                ) : (
                  <img
                    src="QportCMS2.png"
                    alt="Fold"
                    style={{ width: 163, height: 40 }}
                  />
                )
              }
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
          </Header>
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              background: "#fff",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  alignSelf: "center",
                  fontWeight: "bold",
                  fontSize: "26px",
                }}
              >
                訊息表格
              </div>
              <div>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onPressEnter={handleAdd}
                  style={{ width: 300, marginRight: 8 }}
                  placeholder="請輸入内容"
                />
                <Button
                  type="primary"
                  onClick={handleAdd}
                  style={{ backgroundColor: "gray" }}
                >
                  新增
                </Button>
              </div>
            </div>

            <Table
              components={{
                body: {
                  row: EditableRow,
                  cell: EditableCell,
                },
              }}
              rowClassName={() => "editable-row"}
              dataSource={data}
              columns={mergedColumns}
              rowKey="key"
              className="custom-table"
              pagination={{
                onChange: cancel,
              }}
              form={form}
            />
          </Content>
        </Layout>
      </Layout>
    </EditableContext.Provider>
  );
};

export default App;

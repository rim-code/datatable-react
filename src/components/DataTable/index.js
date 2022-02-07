import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Popconfirm, Space, Form, Input } from "antd";
import "antd/dist/antd.css";
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';

import { isEmpty } from "lodash";

const DataTable = () => {

    const [gridData, setGridData] = useState([]);
    const [loading, setLoading] = useState(false);
    //edit
    const [editingKey, setEditingkey] = useState("");
    const [form] = Form.useForm();
    //sorting
    const [sortedInfo, setSortedInfo] = useState({});
    //searching
    const [searchText, setSearchText] = useState("");
    let [filteredData] = useState();
    //Search Value Column 
    const [searchColText, setSearchColText] = useState("");
    const [searchedCol, setSearchedCol] = useState("");


    useEffect(() => {
        loadData();
    }, [])

    //fetch griddata
    const loadData = async () => {
        setLoading(true);
        const response = await axios.get("https://jsonplaceholder.typicode.com/comments");
        setGridData(response.data);
        setLoading(false);
    }
    // console.log("gridData", gridData);
    //delete record
    const handleDelete = (value) => {
        const dataSource = [...modifiedData] // make a separate copy of the state array
        const filteredData = dataSource.filter(item => item.id !== value.id);
        setGridData(filteredData);
    };



    const modifiedData = gridData.map(({ body, ...item }) => ({
        ...item,
        key: item.id,
        info:`My name is ${item.email.split("@")[0]} and i am ${Math.floor(Math.random() * 6)+ 20
        } year old`,
        comment: isEmpty(body) ? item.comment : body,
    }));

    // console.log("modifiedData", modifiedData)



    //Search value column wise 

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() => handleSearchCol(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearchCol(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button onClick={() => handleResetCol(clearFilters)}
                        size="small"
                        style={{ width: 90 }}>
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
            ),
        onFilter: (value, record) =>
            record[dataIndex]  ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
            : "",
        render: (text) =>
           searchedCol === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchColText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ""}
                />
            ) : (
                text
            ),
    
  });


 const  handleSearchCol= (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchColText(selectedKeys[0]);
    setSearchedCol(dataIndex);
  };

 const  handleResetCol = (clearFilters) => {
    clearFilters();
    setSearchColText("");
  };







const edit = (record) => {
    form.setFieldsValue({
        name: "",
        email: "",
        comment: "",
        ...record,
    });
    setEditingkey(record.key);
};


const cancel = () => {
    setEditingkey("");
};


const handleChange = (...sorter) => {
    console.log("sorter", sorter);
    const { order, field } = sorter[2];
    setSortedInfo({ columnKey: field, order })
};

const save = async (key) => {
    try {
        const row = await form.validateFields();
        const newData = [...modifiedData];
        const index = newData.findIndex((item) => key === item.key);
        if (index > -1) {
            const item = newData[index];
            newData.splice(index, 1, { ...item, ...row });
            setGridData(newData);
            setEditingkey("");
        } else {
            newData.push(row);
            setGridData(newData);
            setEditingkey("");
        }
    } catch (error) {
        console.log("Error", error);
    }
};





const EditableCell = ({
    editing,
    dataIndex,
    title,
    record,
    children,
    ...restProps
}) => {
    const input = <Input />
    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{
                        margin: 0,
                    }}
                    rules={[
                        {
                            required: true,
                            message: `Please Input ${title}!`,
                        },
                    ]}
                >
                    {input}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};


const clearAll = () => {
    setSortedInfo({});
    setSearchText("");
    loadData();
};

const columns = [
    {
        title: 'ID',
        dataIndex: 'id',
    },
    {
        title: 'Name',
        dataIndex: 'name',
        align: 'center',
        editable: true,
        sorter: (a, b) => a.name.length - b.name.length,
        sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
        ...getColumnSearchProps("name"),
    },
    {
        title: 'Email',
        dataIndex: 'email',
        align: 'center',
        editable: true,
        sorter: (a, b) => a.email.length - b.email.length,
        sortOrder: sortedInfo.columnKey === "email" && sortedInfo.order,
        ...getColumnSearchProps("email"),
    },
    {
        title: 'Comment',
        dataIndex: 'comment',
        align: 'center',
        editable: true,
        sorter: (a, b) => a.comment.length - b.comment.length,
        sortOrder: sortedInfo.columnKey === "comment" && sortedInfo.order,
        ...getColumnSearchProps("comment"),
    },
    {
        title: 'Actions',
        dataIndex: 'actions',
        align: 'center',
        render: (_, record) => {
            const editable = isEditing(record);

            return modifiedData.length >= 1 ? (
                <Space>
                    <Popconfirm
                        title="Are you sure to delete this record"
                        onConfirm={() => handleDelete(record)}
                    >
                        <Button type="primary" danger disabled={editable} >Delete</Button>

                    </Popconfirm>

                    {editable ? (

                        <span size="middle">
                            <Button
                                onClick={(e) => save(record.key)}
                                type="primary"
                                style={{ marginBottom: "8px" }}
                            >save</Button>

                            <Popconfirm
                                title="Sure to cancel?"
                                onConfirm={cancel}
                            >
                                <Button>Cancel</Button>
                            </Popconfirm>
                        </span>

                    ) : (
                        <Button onClick={() => edit(record)} type="primary">Edit</Button>
                    )}
                </Space>
            ) : null;
        },
    },

];




const isEditing = (record) => {
    return record.key === editingKey
};


const mergedColumns = columns.map((col) => {
    if (!col.editable) {
        return col;
    }
    return {
        ...col,
        onCell: (record) => ({
            record,
            dataIndex: col.dataIndex,
            title: col.title,
            editing: isEditing(record),
        }),
    };
});

const handleSearch = (e) => {
    setSearchText(e.target.value);
    if (e.target.value === "") {
        loadData();
    }
};

const globalSearch = () => {
    filteredData = modifiedData.filter((value) => {
        return (
            value.name.toLowerCase().includes(searchText.toLowerCase()) ||
            value.email.toLowerCase().includes(searchText.toLowerCase()) ||
            value.comment.toLowerCase().includes(searchText.toLowerCase())
        );
    });
    setGridData(filteredData);
};




return (
    <div>
        <Space style={{ marginBottom: 16, marginLeft: 30 }}>
            <Input
                placeholder="Enter Search Text"
                onChange={handleSearch}
                type="text"
                allowClear
                value={searchText}
            />
            <Button type="primary" onClick={globalSearch}>Search</Button>
            <Button onClick={clearAll} >Clear All </Button>
        </Space>
        <Form form={form} component={false}>
            <Table
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
                columns={mergedColumns}

                expandable={{
                    expandedRowRender: (record ) => (
                    <p style={{ margin: 0 }}>{record.info}</p>)
                    ,
                    rowExpandable: (record) => record.info !== 'Not Expandable',
                  }}

                dataSource={filteredData && filteredData.length ? filteredData : modifiedData}
                bordered
                loading={loading}
                onChange={handleChange}
            />
        </Form>

    </div>
);
};
export default DataTable;

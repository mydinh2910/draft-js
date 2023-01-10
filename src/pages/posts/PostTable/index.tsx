import React, { useEffect, useState } from 'react';
import { Popconfirm, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Button, Modal, Input } from 'antd';
import { AtomicBlockUtils, convertFromRaw, convertToRaw, Editor, EditorState, RichUtils } from 'draft-js';
import * as postService from "../../../services/postService";
import * as loginService from "../../../services/loginService";
import BlockStyleControls from '../Component/BlockStyleControls';
import InlineStyleControls from '../Component/InlineStyleControls';
import "./index.css";
import { useNavigate } from 'react-router-dom';

interface DataType {
  key: number;
  title: string;
  content: any;
  shortDescriptions: string;
  status: string;
}

const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2
  }
};

const getBlockStyle = (block: any) => {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote';
    default:
      return null;
  }
}


const PostTable: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("CREATE");

  const [posts, setPosts] = useState([] as any);

  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [postId, setPostId] = useState(0);
  const [title, setTitle] = useState("");
  const [shortDescriptions, setShortDescriptions] = useState("");

  const [showURLInput, setShowURLInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [urlType, setUrlType] = useState("");

  const columns: ColumnsType<DataType> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Short Descriptions',
      dataIndex: 'shortDescriptions',
      key: 'shortDescriptions',
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (_, { status }) => (
        <>
          <Tag color="green" key={status}>
            {status.toUpperCase()}
          </Tag>
        </>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type='dashed' onClick={() => {
            const contentState = convertFromRaw(JSON.parse(record.content));

            setEditorState(EditorState.createWithContent(contentState));
            setPostId(record.key);
            setTitle(record.title);
            setShortDescriptions(record.shortDescriptions);
            setMode("EDIT");
            setOpen(true);
          }}>Edit</Button>
          <Popconfirm title="Sure to delete?" onConfirm={() => onDeletePost(record.key)}>
            <Button type='ghost' style={{ backgroundColor: "red", color: "white" }}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const toggleBlockType = (blockType: any) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  }

  const toggleInlineStyle = (inlineStyle: any) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  }

  const handleKeyCommand = (command: any) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return true;
    }
    return false;
  }

  const mediaBlockRenderer = (block: any) => {
    const Media = (props: any) => {
      const entity = props.contentState.getEntity(props.block.getEntityAt(0));
      const { src } = entity.getData();
      const type = entity.getType();
      let media;
      if (type === 'audio') {
        media = <audio controls src={src} style={{ width: "100%" }} />;
      } else if (type === 'image') {
        media = <img src={src} style={{ width: "100%" }} alt="Example" />;
      } else if (type === 'video') {
        media = <video controls src={src} style={{ width: "100%" }} />;
      }
      return media;
    };

    if (block.getType() === 'atomic') {
      return { component: Media, editable: false };
    }
    return null;
  }

  const onConfirmMedia = (e: any) => {
    e.preventDefault();
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(urlType, 'IMMUTABLE', { src: urlValue });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });

    setEditorState(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '))
    setShowURLInput(false);
    setUrlValue("");
  }

  const onPromptForMedia = (type: string) => {
    setShowURLInput(true);
    setUrlValue("");
    setUrlType(type);
  }

  const onURLInputKeyDown = (e: any) => {
    if (e.which === 13) {
      onConfirmMedia(e);
    }
  }

  const onDeletePost = (id: number) => {
    postService.deletePost(id)
      .then(() => {
        postService.getPost().then(posts => {
          setPosts(posts.map((value: any) => ({ ...value, key: value.postId })));
        });
      })
      .catch(error => {
        const msg = error.response.data.msg || "Something went wrong while deleting";
        alert(msg);
      });
  }

  const onCreatePost = () => {
    setTitle("");
    setShortDescriptions("");
    setEditorState(EditorState.createEmpty());
    setMode("CREATE");
    setOpen(true);
  }

  const onLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  }

  const onCancel = () => {
    setLoading(false);
    setOpen(false);
  }

  const onOk = async () => {
    try {
      if (mode === "EDIT") {
        await postService.updatePost(
          postId,
          {
            title,
            shortDescriptions,
            content: convertToRaw(editorState.getCurrentContent())
          }
        );

        postService.getPost().then(posts => {
          setPosts(posts.map((value: any) => ({ ...value, key: value.postId })));
        });

        alert("update success");
        setOpen(false);
        return;
      }

      if (mode === "CREATE") {
        await postService.createPost({
          title,
          shortDescriptions,
          content: convertToRaw(editorState.getCurrentContent())
        });

        postService.getPost().then(posts => {
          setPosts(posts.map((value: any) => ({ ...value, key: value.postId })));
        });
        alert("create success")
        setOpen(false);
      }
    } catch (error: any) {
      const data = error.response?.data;
      const msg = data?.msg || data?.message || "Something went wrong";
      alert(msg);
    }
  }


  let className = 'RichEditor-editor';
  var contentState = editorState?.getCurrentContent();

  if (!contentState?.hasText()) {
    if (contentState?.getBlockMap().first().getType() !== 'unstyled') {
      className += ' RichEditor-hidePlaceholder';
    }
  }

  useEffect(() => {
    const isLogin = loginService.checkLogin();

    if (!isLogin) return navigate("/login");

    postService.getPost().then(posts => {
      setPosts(posts.map((value: any) => ({ ...value, key: value.postId })));
    });
  }, []);

  return (
    <>
      <Modal
        title={mode}
        centered
        open={open}
        onOk={onOk}
        onCancel={onCancel}
        width={1000}
        confirmLoading={loading}
      >
        <span>Title</span>
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <span>Content</span>
        <div className="RichEditor-root">
          <BlockStyleControls
            editorState={editorState}
            onToggle={toggleBlockType}
          />
          <InlineStyleControls
            editorState={editorState}
            onToggle={toggleInlineStyle}
          />
          <div>
            <Button type='default' onMouseDown={() => onPromptForMedia("image")}>Add image</Button>
            <Button type='default' style={{ marginLeft: "10px" }} onMouseDown={() => onPromptForMedia("audio")}>Add audio</Button>
            <Button type='default' style={{ marginLeft: "10px" }} onMouseDown={() => onPromptForMedia("video")}>Add video</Button>
            {
              showURLInput && (
                <div style={{ marginTop: 6 }}>
                  <input
                    onChange={(e) => setUrlValue(e.target.value)}
                    type="text"
                    value={urlValue}
                    onKeyDown={onURLInputKeyDown}
                  />
                  <Button type='primary' onMouseDown={onConfirmMedia} style={{ marginLeft: 4 }}>
                    Confirm
                  </Button>
                </div>
              )
            }
          </div>

          <div className={className}>
            <Editor
              blockRendererFn={mediaBlockRenderer}
              blockStyleFn={getBlockStyle as any}
              customStyleMap={styleMap}
              editorState={editorState}
              handleKeyCommand={handleKeyCommand as any}
              onChange={(e) => setEditorState(e)}
              onTab={(e) => setEditorState(RichUtils.onTab(e, editorState, 4))}
              placeholder="Tell a story..."
              spellCheck={false}
            />
          </div>

        </div>
        <span>Short description</span>
        <Input.TextArea autoSize value={shortDescriptions} onChange={(e) => setShortDescriptions(e.target.value)} />
      </Modal>
      <Button type='primary' onClick={onCreatePost}>Create post</Button>
      <Button type='primary' onClick={onLogout}>Logout</Button>
      <Table columns={columns} dataSource={posts} />
    </>
  );
};

export default PostTable;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical,
  Users,
  Hash,
  Plus
} from 'lucide-react';

const Messages: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState('');

  const chats = [
    {
      id: 1,
      name: 'Ocean Engineering Study Group',
      type: 'group',
      avatar: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      lastMessage: 'Hey everyone, did you complete the hydrodynamics assignment?',
      lastMessageTime: '10:30 AM',
      unreadCount: 3,
      isOnline: true,
      members: 24
    },
    {
      id: 2,
      name: 'Rahul Sharma',
      type: 'direct',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      lastMessage: 'Can you share the marine design notes?',
      lastMessageTime: '9:45 AM',
      unreadCount: 1,
      isOnline: true,
      department: 'Naval Architecture'
    },
    {
      id: 3,
      name: 'NA Semester 6 General',
      type: 'channel',
      avatar: '#',
      lastMessage: 'Lecture schedule for next week has been updated',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      isOnline: false,
      members: 156
    },
    {
      id: 4,
      name: 'Priya Patel',
      type: 'direct',
      avatar: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      lastMessage: 'Thanks for the help with the project!',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      isOnline: false,
      department: 'Ocean Engineering'
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'Rahul Sharma',
      content: 'Hey everyone! Hope you\'re all doing well. I wanted to discuss the upcoming marine design project.',
      timestamp: '10:15 AM',
      isOwnMessage: false,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2'
    },
    {
      id: 2,
      sender: 'You',
      content: 'Hi Rahul! Yes, I\'ve been working on the preliminary calculations. Do you have the latest specifications?',
      timestamp: '10:18 AM',
      isOwnMessage: true
    },
    {
      id: 3,
      sender: 'Priya Patel',
      content: 'I can share the updated specs. Also found some great reference materials from the offshore technology course.',
      timestamp: '10:20 AM',
      isOwnMessage: false,
      avatar: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2'
    },
    {
      id: 4,
      sender: 'You',
      content: 'That would be really helpful! Could you share them in the group?',
      timestamp: '10:22 AM',
      isOwnMessage: true
    },
    {
      id: 5,
      sender: 'Amit Kumar',
      content: 'I\'ve also been working on the hydrodynamic analysis part. We should coordinate our efforts to avoid duplication.',
      timestamp: '10:25 AM',
      isOwnMessage: false,
      avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2'
    },
    {
      id: 6,
      sender: 'Rahul Sharma',
      content: 'Great idea! Let\'s set up a meeting tomorrow to discuss the division of work. What time works for everyone?',
      timestamp: '10:28 AM',
      isOwnMessage: false,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2'
    },
    {
      id: 7,
      sender: 'You',
      content: 'Tomorrow afternoon around 3 PM works for me. We can meet in the naval architecture lab.',
      timestamp: '10:30 AM',
      isOwnMessage: true
    }
  ];

  const selectedChatData = chats.find(chat => chat.id === selectedChat);

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      setNewMessage('');
    }
  };

  const getChatIcon = (chat: any) => {
    if (chat.type === 'channel') {
      return <Hash className="h-6 w-6 text-gray-400" />;
    } else if (chat.type === 'group') {
      return <Users className="h-6 w-6 text-gray-400" />;
    } else {
      return (
        <img 
          src={chat.avatar} 
          alt={chat.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] bg-gray-800 rounded-xl overflow-hidden flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">SamudraSetu</h2>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Plus className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors ${
                selectedChat === chat.id ? 'bg-gray-800 border-r-2 border-r-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {chat.type === 'channel' ? (
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <Hash className="h-5 w-5 text-gray-300" />
                    </div>
                  ) : chat.type === 'group' ? (
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  ) : (
                    <img 
                      src={chat.avatar} 
                      alt={chat.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  {chat.isOnline && chat.type === 'direct' && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium truncate">{chat.name}</h3>
                    <span className="text-gray-400 text-xs">{chat.lastMessageTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-sm truncate">{chat.lastMessage}</p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-5 text-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  {(chat.type === 'group' || chat.type === 'channel') && (
                    <p className="text-gray-500 text-xs">{chat.members} members</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {selectedChatData && getChatIcon(selectedChatData)}
              <div>
                <h3 className="text-white font-semibold">{selectedChatData?.name}</h3>
                {selectedChatData?.type === 'direct' ? (
                  <p className="text-gray-400 text-sm">
                    {selectedChatData.isOnline ? 'Online' : 'Last seen yesterday'}
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm">{selectedChatData?.members} members</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Phone className="h-5 w-5 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Video className="h-5 w-5 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <MoreVertical className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-3 max-w-2xl ${message.isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!message.isOwnMessage && (
                  <img 
                    src={message.avatar} 
                    alt={message.sender}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div className={`p-3 rounded-2xl ${
                  message.isOwnMessage 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-white'
                }`}>
                  {!message.isOwnMessage && (
                    <p className="text-xs text-gray-300 mb-1">{message.sender}</p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Paperclip className="h-5 w-5 text-gray-400" />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Send className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
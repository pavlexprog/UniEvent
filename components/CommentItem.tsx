import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext'; 
import { BASE_URL } from '@/lib/config';
export interface Author {
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}
export interface CommentItemProps {
  id: number;
  author: Author;
  text: string;
  date: string;
  avatarUrl?: string;
  onReply?: () => void;
  onLike?: () => void;
  isReply?: boolean;
  likeCount?: number;
  isLiked?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  author,
  text,
  date,
  onReply,
  onLike,
  isReply = false,
  likeCount,
  isLiked = false
}) => {
  const avatarPath = author.avatar_url;

  const fullAvatarUrl = avatarPath?.startsWith('http')
    ? avatarPath
    : `${BASE_URL}${avatarPath}`;
 const initial =
  (author?.first_name?.[0] || author?.last_name?.[0] || '?').toUpperCase();
  console.log('Аватар автора:', author.avatar_url);
 
const formatDate = (raw: string) => {
  const date = new Date(raw);
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

  return (
    <View style={[styles.container, isReply && styles.replyContainer]}>
      <View style={styles.header}>
        {fullAvatarUrl ? (
          <Image source={{ uri: fullAvatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.initial}>{initial}</Text>
          </View>
        )}
        <View style={styles.meta}>
          <Text style={styles.author}> {author.first_name} {author.last_name}</Text>
        <Text style={styles.date}>{formatDate(date)}</Text>
        </View>
        <TouchableOpacity onPress={onLike} style={styles.likeButton} activeOpacity={0.7}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={isLiked ? 'red' : '#888'}
          />
          {typeof likeCount === 'number' && (
            <Text style={{ marginLeft: 4 }}>{likeCount}</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.text}>{text}</Text>

      <View style={styles.replyWrapper}>
        <TouchableOpacity onPress={onReply}>
          <Text style={styles.replyText}>Ответить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  replyContainer: {
    marginLeft: 40,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  initial: {
    color: '#555',
    fontWeight: 'bold',
    fontSize: 16,
  },
  meta: {
    flex: 1,
  },
  author: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 14,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  text: {
    color: '#333',
    lineHeight: 18,
    marginBottom: 4,
  },
  replyText: {
    color: '#2e7d32',
    fontSize: 13,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  replyWrapper: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
});

export default CommentItem;

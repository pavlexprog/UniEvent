import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CommentItemProps {
  author: string;
  text: string;
  date: string;
  avatarUrl?: string;
  onReply?: () => void;
  onLike?: () => void;
  isReply?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  author,
  text,
  date,
  avatarUrl,
  onReply,
  onLike,
  isReply = false,
}) => {
  const initial = author?.charAt(0).toUpperCase() || '?';

 return (
  <View style={[styles.container, isReply && styles.replyContainer]}>
    <View style={styles.header}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.initial}>{initial}</Text>
        </View>
      )}
      <View style={styles.meta}>
        <Text style={styles.author}>{author}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <TouchableOpacity onPress={onLike} style={styles.likeButton}>
        <Ionicons name="heart-outline" size={18} color="#888" />
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
  replyButton: {
    marginTop: 4,
  },
  replyText: {
    color: '#2e7d32',
    fontSize: 13,
  },
  likeButton: {
    padding: 4,
  },
  actions: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginTop: 4,
  gap: 16,
},
replyBanner: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#f0f0f0',
  padding: 8,
  marginBottom: 6,
  borderRadius: 6,
},
replyingToText: {
  fontSize: 13,
  color: '#333',
},
replyWrapper: {
  alignItems: 'flex-end',
  marginTop: 4,
},


});

export default CommentItem;

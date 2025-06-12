import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import CommentItem from './CommentItem';
import { CommentItemProps } from './CommentItem';
import { useAuthContext } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useRef } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface Comment extends Omit<CommentItemProps, 'onReply' | 'onLike'> {
  parent_id?: number | null;
  replies?: Comment[];
  
}
interface CommentListProps {
  eventId: number;
}

const CommentList: React.FC<CommentListProps> = ({ eventId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const { user: authUser } = useAuthContext();
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyToUser, setReplyToUser] = useState<string | null>(null);

  const groupComments = (flatComments: Comment[]): Comment[] => {
  const map = new Map<number, Comment & { replies: Comment[] }>();
  const roots: Comment[] = [];

  flatComments.forEach(comment => {
    map.set(comment.id, { ...comment, replies: [] });
  });

  flatComments.forEach(comment => {
    if (comment.parent_id) {
      const parent = map.get(comment.parent_id);
      if (parent) {
        parent.replies.push({ ...comment, isReply: true });
      }
    } else {
      roots.push(map.get(comment.id)!);
    }
  });

  return roots;
};


    useEffect(() => {
    const loadComments = async () => {
      try {
        console.log(eventId)
        
        const response = await api.get(`/comments/event/${eventId}`);
        const grouped = groupComments(
  response.data.map((c: any) => ({
    ...c,
    date: c.created_at, 
    isLiked: c.is_liked || false,     // чтобы не терялся флаг лайка
    likeCount: c.like_count,     // для отображения количества лайков
  }))
);
setComments(grouped);
   
      } catch (error) {
        console.error('Ошибка загрузки комментариев:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, []);

  const deleteComment = async (id: number) => {
  try {
    await api.delete(`/comments/${id}`);
  } catch (error) {
    console.error('Ошибка при удалении комментария:', error);
    throw error;
  }
};
  const handleLike = (id: number) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === id
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likeCount: comment.isLiked ? comment.likeCount! - 1 : (comment.likeCount || 0) + 1,
            }
          : {
              ...comment,
              replies: comment.replies?.map(reply =>
                reply.id === id
                  ? {
                      ...reply,
                      isLiked: !reply.isLiked,
                      likeCount: reply.isLiked
                        ? reply.likeCount! - 1
                        : (reply.likeCount || 0) + 1,
                    }
                  : reply
              ),
            }
      )
    );
  };
 const inputRef = useRef<TextInput>(null);
  const addComment = async () => {
  if (commentText.trim() === '') return;

  try {
    const newComment = {
      event_id: eventId, // или просто eventId, в зависимости от API
      text: commentText,
      
      author_id: authUser?.id, // если надо, или просто имя
      parent_id: replyTo, // null, если это не ответ
    };
console.log('Отправляем комментарий:', newComment);
    const response = await api.post('/comments/', newComment);
   
    // Обнови список после успешной отправки
    const created = response.data;
    setComments(prev =>
      replyTo
        ? prev.map(comment =>
            comment.id === replyTo
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), { ...created, isReply: true }],
                }
              : comment
          )
        : [...prev, created]
    );

    setCommentText('');
    setReplyTo(null);
    setReplyToUser(null);
  } catch (err) {
    console.error('Ошибка при добавлении комментария', err);
  }
};

  const renderComment = (comment: Comment) => (
    <View key={comment.id}>
      <CommentItem
        {...comment}
        onLike={() => handleLike(comment.id)}
        
        onReply={() => {
          setReplyTo(comment.id);
          setReplyToUser(`${comment.author.first_name} ${comment.author.last_name}`);
          setCommentText(`${comment.author.first_name}, `);
           setTimeout(() => {
    inputRef.current?.focus();
  }, 100);
  
        }}
      />
      {comment.replies?.map(reply => (
        <CommentItem
          key={reply.id}
          {...reply}
          onLike={() => handleLike(reply.id)}
          
          onReply={() => {
            setReplyTo(comment.id);
            setReplyToUser(`${comment.author.first_name} ${comment.author.last_name}`);
            setCommentText(`${comment.author.first_name}, `);
             setTimeout(() => {
    inputRef.current?.focus();
  }, 100);
          }}
          
        />
      ))}
    </View>
  );

  return (
  <KeyboardAwareScrollView
    contentContainerStyle={{ padding: 16, flexGrow: 1 }}
    enableOnAndroid={true}
    extraScrollHeight={10}           // Отступ при поднятии экрана (настрой по вкусу)
    keyboardShouldPersistTaps="handled"
  >
    {comments.length === 0 ? (
      <Text style={{ color: '#888' }}>Пока нет комментариев</Text>
    ) : (
      <View>{comments.map(renderComment)}</View>
    )}

    {/* Блок ответа */}
    {replyTo && replyToUser && (
      <View style={styles.replyBanner}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text ellipsizeMode="tail">
              Ответ пользователю {replyToUser}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setReplyTo(null);
              setReplyToUser(null);
              setCommentText('');
            }}
            style={{
              backgroundColor: '#d32f2f',
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </View>
    )}

    {/* Поле ввода */}
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
      <TextInput
        ref={inputRef}
        placeholder="Оставить комментарий..."
        value={commentText}
        onChangeText={setCommentText}
        style={{
          flex: 1,
          backgroundColor: '#f0f0f0',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          marginRight: 8,
        }}
      />
      <TouchableOpacity
        onPress={addComment}
        style={{
          backgroundColor: '#2e7d32',
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Отправить</Text>
      </TouchableOpacity>
    </View>
  </KeyboardAwareScrollView>
);

};

export default CommentList;

const styles = {
  replyBanner: {
    marginTop: 8,
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#e0f2f1',
    borderRadius: 8,
  },
  replyingToText: {
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
};

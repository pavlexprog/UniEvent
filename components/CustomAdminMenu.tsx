import React from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  top: number;
  left: number;
  onApprove?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export const CustomAdminMenu = ({
  visible,
  onClose,
  top,
  left,
  onApprove,
  onEdit,
  onDelete,
}: Props) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.menu, { top, left }]}>
            {onApprove && (
              <TouchableOpacity style={styles.item} onPress={onApprove}>
                <Text style={styles.text}>Одобрить</Text>
              </TouchableOpacity>
            )}
            {onEdit && (
              <TouchableOpacity style={styles.item} onPress={onEdit}>
                <Text style={styles.text}>Редактировать</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity style={styles.item} onPress={onDelete}>
                <Text style={[styles.text, { color: 'red' }]}>Удалить</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    flex: 1,
  },
  menu: {
    position: 'absolute',
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
  },
});

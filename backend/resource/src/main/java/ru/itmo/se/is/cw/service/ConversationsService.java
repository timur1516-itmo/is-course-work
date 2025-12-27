package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.ConversationParticipantResponseDto;
import ru.itmo.se.is.cw.dto.ConversationResponseDto;
import ru.itmo.se.is.cw.dto.MessageResponseDto;
import ru.itmo.se.is.cw.dto.SendMessageRequestDto;
import ru.itmo.se.is.cw.dto.filter.MessageFilter;
import ru.itmo.se.is.cw.dto.specification.MessageSpecification;
import ru.itmo.se.is.cw.exception.EntityNotFoundException;
import ru.itmo.se.is.cw.mapper.ConversationMapper;
import ru.itmo.se.is.cw.mapper.ConversationParticipantMapper;
import ru.itmo.se.is.cw.mapper.MessageMapper;
import ru.itmo.se.is.cw.model.ClientOrderEntity;
import ru.itmo.se.is.cw.model.ConversationEntity;
import ru.itmo.se.is.cw.model.ConversationParticipantEntity;
import ru.itmo.se.is.cw.model.MessageEntity;
import ru.itmo.se.is.cw.model.value.ConversationStatus;
import ru.itmo.se.is.cw.repository.ConversationParticipantRepository;
import ru.itmo.se.is.cw.repository.ConversationRepository;
import ru.itmo.se.is.cw.repository.MessageRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationsService {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final MessageRepository messageRepository;
    private final ConversationMapper conversationMapper;
    private final MessageMapper messageMapper;
    private final ConversationParticipantMapper conversationParticipantMapper;
    private final CurrentUserService currentUserService;

    @Transactional
    public ConversationEntity createConversationForOrder(ClientOrderEntity order) {
        ConversationEntity conversation = new ConversationEntity();
        conversation.setOrder(order);
        conversation.setStatus(ConversationStatus.ACTIVE);
        return conversationRepository.save(conversation);
    }

    @Transactional
    public void addParticipantToConversation(ConversationEntity conversation, Long userId) {
        ConversationParticipantEntity participant = new ConversationParticipantEntity();
        participant.setConversation(conversation);
        participant.setUserId(userId);
        participantRepository.save(participant);
    }

    @Transactional(readOnly = true)
    public ConversationResponseDto getConversationByOrderId(Long orderId) {
        ConversationEntity conversation = conversationRepository
                .findByOrderId(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation for order with id " + orderId + " not found"));
        assertCanAccess(conversation);
        return conversationMapper.toDto(conversation);
    }

    @Transactional(readOnly = true)
    public ConversationEntity getById(Long id) {
        return conversationRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Conversation with id " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public Page<MessageResponseDto> getMessages(Long id, Pageable pageable, MessageFilter filter) {
        ConversationEntity conversation = getById(id);
        assertCanAccess(conversation);
        if (filter == null) filter = new MessageFilter();
        filter.setConversationId(id);
        return messageRepository
                .findAll(MessageSpecification.byFilter(filter), pageable)
                .map(messageMapper::toDto);
    }

    @Transactional
    public MessageResponseDto sendMessage(Long id, SendMessageRequestDto request) {
        ConversationEntity conversation = getById(id);
        assertCanAccess(conversation);

        ConversationParticipantEntity participant = participantRepository
                .findByConversationIdAndUserId(conversation.getId(), currentUserService.getAccountId())
                .orElseThrow(() -> new RuntimeException("Unexpected state"));

        MessageEntity message = new MessageEntity();
        message.setContent(request.getContent());
        message.setConversationParticipant(participant);

        return messageMapper.toDto(messageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public List<ConversationParticipantResponseDto> getParticipants(Long conversationId) {
        ConversationEntity conversation = getById(conversationId);
        assertCanAccess(conversation);
        return participantRepository
                .findByConversationIdOrderByJoinedAtAsc(conversationId)
                .stream()
                .map(conversationParticipantMapper::toDto)
                .toList();
    }

    private void assertCanAccess(ConversationEntity conversation) {
        if (!participantRepository.existsByConversationIdAndUserId(conversation.getId(), currentUserService.getAccountId())) {
            throw new EntityNotFoundException("Conversation with id " + conversation.getId() + " not found");
        }
    }
}

package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.Conversation;
import ru.itmo.se.is.cw.dto.ConversationParticipant;
import ru.itmo.se.is.cw.dto.Message;
import ru.itmo.se.is.cw.dto.SendMessageRequest;
import ru.itmo.se.is.cw.repository.ConversationParticipantRepository;
import ru.itmo.se.is.cw.repository.ConversationRepository;
import ru.itmo.se.is.cw.repository.MessageRepository;

import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationsService {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final MessageRepository messageRepository;

    @Transactional(readOnly = true)
    public Conversation getConversationByOrderId(Long orderId) {
        return null;
    }

    @Transactional(readOnly = true)
    public Conversation getConversation(Long id) {
        return null;
    }

    @Transactional(readOnly = true)
    public List<Message> getMessages(Long conversationId, ZonedDateTime since, Integer limit) {
        return List.of();
    }

    @Transactional
    public Message sendMessage(Long conversationId, SendMessageRequest request) {
        return null;
    }

    @Transactional(readOnly = true)
    public List<ConversationParticipant> getParticipants(Long conversationId) {
        return List.of();
    }
}

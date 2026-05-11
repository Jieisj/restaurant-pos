package com.jie.restaurant_pos.repository;

import com.jie.restaurant_pos.entity.CartItemNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

public interface CartItemNoteRepository extends JpaRepository<CartItemNote, Long> {
    List<CartItemNote> findByCartItemId(Long cartItemId);

    @Query("select coalesce(sum(note.price), 0) from CartItemNote note where note.cartItemId = :cartItemId")
    BigDecimal sumPriceByCartItemId(@Param("cartItemId") Long cartItemId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("delete from CartItemNote note where note.id = :id")
    int deleteByIdDirect(@Param("id") Long id);
}

package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.entity.Customer;
import com.jie.restaurant_pos.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository repository;

    public List<Customer> getAllCustomers() {
        return repository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    public Customer getCustomerByPhone(String phone) {
        return repository.findByPhoneNumber(phone)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }


    public Customer getCustomerByName(String name) {
        return repository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    public Customer getCustomerByAddress(String address){
        return repository.findByAddress(address).orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    public Customer addCustomer(Customer customer) {
        return repository.save(customer);
    }

    public Customer updateCustomer(Long id, Customer updatedCustomer) {
        Customer customer = getCustomerById(id);

        customer.setName(updatedCustomer.getName());
        customer.setPhoneNumber(updatedCustomer.getPhoneNumber());
        customer.setAddress(updatedCustomer.getAddress());

        return repository.save(customer);
    }

    public void deleteCustomer(Long id) {
        repository.deleteById(id);
    }
}

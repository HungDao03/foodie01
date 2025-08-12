package com.foodie1.service.role;


import com.foodie1.model.Role;
import com.foodie1.repo.IRoleRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService implements IRoleService {
    @Autowired
    private IRoleRepo roleRepo;

    @Override
    public List<Role> findAll() {
        return roleRepo.findAll();
    }

    @Override
    public Role findById(Long id) {
        return roleRepo.findById(id).orElse(null);
    }

    @Override
    public Role findByName(String name) {
        return roleRepo.findByName(name);
    }

    @Override
    public Role save(Role role) {
        return roleRepo.save(role);
    }

    @Override
    public void delete(Role role) {
        roleRepo.delete(role);
    }
}

package com.foodie1.service.role;


import com.foodie1.model.Role;
import com.foodie1.service.IGenericService;

public interface IRoleService extends IGenericService<Role> {
    Role findByName(String name);
}
